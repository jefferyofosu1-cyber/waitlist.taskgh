import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { updateNotificationByExternalId } from "@/lib/notification-events";

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  if (!env.webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const secret = request.headers.get("x-webhook-secret");
  if (secret !== env.webhookSecret) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const provider = body?.provider as "brevo" | "flashsms" | undefined;
  const externalMessageId = body?.externalMessageId as string | undefined;
  const status = body?.status as "sent" | "failed" | "delivered" | undefined;

  if (!provider || !externalMessageId || !status) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  await updateNotificationByExternalId({
    provider,
    externalMessageId,
    status,
    payload: body,
  });

  return NextResponse.json({ ok: true });
}
