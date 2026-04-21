import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { sendBrevoConfirmationEmail, sendFlashSmsConfirmation } from "@/lib/providers";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getClientIpHeaderValue, generateReferralCode, getFirstName } from "@/lib/utils";
import { waitlistSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = getClientIpHeaderValue(request.headers.get("x-forwarded-for")) ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please try again soon." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  if (parsed.data.hpField) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdminClient();

  const existing = await supabase
    .from("waitlist_users")
    .select("id")
    .or(`email.eq.${parsed.data.email},phone_number.eq.${parsed.data.phoneNumber}`)
    .limit(1)
    .maybeSingle();

  if (existing.data) {
    return NextResponse.json(
      { error: "You are already on the waitlist with this email or phone number." },
      { status: 409 },
    );
  }

  const referralCode = generateReferralCode();
  const insertResult = await supabase
    .from("waitlist_users")
    .insert({
      full_name: parsed.data.fullName,
      phone_number: parsed.data.phoneNumber,
      email: parsed.data.email,
      source: parsed.data.source || "direct",
      ip_address: ip,
      referral_code: referralCode,
    })
    .select("referral_code")
    .single();

  if (insertResult.error) {
    return NextResponse.json({ error: "Could not save your signup. Please try again." }, { status: 500 });
  }

  const firstName = getFirstName(parsed.data.fullName);
  await Promise.allSettled([
    sendBrevoConfirmationEmail(parsed.data.email, firstName),
    sendFlashSmsConfirmation(parsed.data.phoneNumber, firstName),
  ]);

  return NextResponse.json({ ok: true, referralCode: insertResult.data.referral_code });
}
