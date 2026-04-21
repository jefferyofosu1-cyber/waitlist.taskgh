import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = body?.username as string | undefined;
  const password = body?.password as string | undefined;

  const env = getServerEnv();
  if (!env.adminUsername || !env.adminPassword) {
    return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
  }

  if (username !== env.adminUsername || password !== env.adminPassword) {
    return NextResponse.json({ error: "Invalid login details" }, { status: 401 });
  }

  await createAdminSession(username);
  return NextResponse.json({ ok: true });
}
