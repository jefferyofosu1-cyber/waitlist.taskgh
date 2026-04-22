import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  const supabase = getSupabaseAdminClient();

  // Fetch all referred_by_code values in one query
  const { data: referrals, error } = await supabase
    .from("waitlist_users")
    .select("referred_by_code")
    .not("referred_by_code", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count referrals per code in memory
  const counts: Record<string, number> = {};
  for (const row of referrals ?? []) {
    if (row.referred_by_code) {
      counts[row.referred_by_code] = (counts[row.referred_by_code] ?? 0) + 1;
    }
  }

  const topCodes = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([code]) => code);

  if (topCodes.length === 0) {
    return NextResponse.json({ rows: [] });
  }

  // Fetch the users who own these referral codes
  const { data: users, error: usersError } = await supabase
    .from("waitlist_users")
    .select("full_name, referral_code")
    .in("referral_code", topCodes);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const rows = topCodes
    .map((code) => {
      const user = users?.find((u) => u.referral_code === code);
      if (!user) return null;
      // Show first name only for privacy
      const firstName = user.full_name.split(" ")[0] ?? user.full_name;
      return { name: firstName, referralCode: code, count: counts[code] ?? 0 };
    })
    .filter(Boolean);

  return NextResponse.json({ rows });
}
