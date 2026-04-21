import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("waitlist_users")
    .select("full_name,email,phone_number,source,referral_code,created_at")
    .order("created_at", { ascending: false });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  const header = ["full_name", "email", "phone_number", "source", "referral_code", "created_at"].join(",");
  const rows = (result.data ?? []).map((row) =>
    [
      row.full_name,
      row.email,
      row.phone_number,
      row.source ?? "",
      row.referral_code ?? "",
      row.created_at,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return new NextResponse([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taskgh-waitlist.csv"',
    },
  });
}
