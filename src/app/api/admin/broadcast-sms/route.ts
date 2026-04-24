import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendFlashSms } from "@/lib/providers";
import { getFirstName } from "@/lib/utils";

export async function POST(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  
  const { data: users, error } = await supabase
    .from("waitlist_users")
    .select("phone_number, full_name, referral_code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ message: "No users to SMS" });
  }

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  for (const user of users) {
    try {
      const firstName = getFirstName(user.full_name);
      const referralLink = `waitlist.taskgh.com/?ref=${user.referral_code}`;
      const message = `Hi ${firstName}, refer 5 friends for TaskGH priority access! Your link: ${referralLink}. Trusted artisans on demand.`;
      
      await sendFlashSms(user.phone_number, message);
      
      successCount++;
    } catch (err) {
      failureCount++;
      errors.push(`${user.phone_number}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return NextResponse.json({
    successCount,
    failureCount,
    errors: errors.slice(0, 50),
    total: users.length
  });
}
