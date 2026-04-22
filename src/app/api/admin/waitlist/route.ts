import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  if (!isValidAdminToken(request.cookies.get("taskgh_admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  const cursorParam = searchParams.get("cursor");
  const supabase = getSupabaseAdminClient();

  // Parse cursor: "created_at|id"
  let cursor: { created_at: string; id: string } | null = null;
  if (cursorParam) {
    const sep = cursorParam.lastIndexOf("|");
    if (sep !== -1) {
      cursor = {
        created_at: cursorParam.slice(0, sep),
        id: cursorParam.slice(sep + 1),
      };
    }
  }

  let dbQuery = supabase
    .from("waitlist_users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);

  if (query) {
    dbQuery = dbQuery.or(`email.ilike.%${query}%,phone_number.ilike.%${query}%`);
  }

  if (cursor) {
    dbQuery = dbQuery.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
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

  const rows = listResult.data ?? [];
  const lastRow = rows[rows.length - 1];
  const nextCursor =
    rows.length === PAGE_SIZE && lastRow
      ? `${lastRow.created_at}|${lastRow.id}`
      : null;

  return NextResponse.json({
    rows,
    nextCursor,
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
