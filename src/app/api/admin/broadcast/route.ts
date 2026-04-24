import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendBrevoEmail } from "@/lib/providers";
import { buildReferralBroadcastEmail } from "@/lib/templates";
import { getFirstName } from "@/lib/utils";

export async function POST(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  
  // Fetch all users who haven't received the referral email yet (if we tracked it)
  // For now, we fetch ALL and rely on the user confirming the broadcast once.
  const { data: users, error } = await supabase
    .from("waitlist_users")
    .select("email, full_name, referral_code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ message: "No users to email" });
  }

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  // Run sequentially to avoid overwhelming the API and easily track progress
  for (const user of users) {
    try {
      const firstName = getFirstName(user.full_name);
      const html = buildReferralBroadcastEmail(firstName, user.referral_code ?? "");
      
      await sendBrevoEmail(
        user.email,
        "Level up on the TaskGH Waitlist 🚀",
        html
      );
      
      successCount++;
    } catch (err) {
      failureCount++;
      errors.push(`${user.email}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return NextResponse.json({
    successCount,
    failureCount,
    errors: errors.slice(0, 50), // Return some errors for debugging
    total: users.length
  });
}
