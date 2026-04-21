import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("notification_events")
    .select("id,user_id,channel,provider,status,error_message,external_message_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: result.data ?? [] });
}
