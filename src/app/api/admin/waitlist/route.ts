import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const supabase = getSupabaseAdminClient();

  let dbQuery = supabase
    .from("waitlist_users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

  if (query) {
    dbQuery = dbQuery.or(`email.ilike.%${query}%,phone_number.ilike.%${query}%`);
  }

  const [listResult, totalResult, todayResult] = await Promise.all([
    dbQuery,
    supabase.from("waitlist_users").select("id", { count: "exact", head: true }),
    supabase
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  if (listResult.error) {
    return NextResponse.json({ error: listResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    rows: listResult.data ?? [],
    stats: {
      total: totalResult.count ?? 0,
      today: todayResult.count ?? 0,
      filtered: listResult.count ?? 0,
    },
  });
}

export async function DELETE(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const result = await supabase.from("waitlist_users").delete().eq("id", id);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
