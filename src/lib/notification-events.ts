import { getSupabaseAdminClient } from "@/lib/supabase";

type Channel = "email" | "sms";
type Provider = "brevo" | "flashsms";
type Status = "queued" | "sent" | "failed" | "delivered";

export async function createNotificationEvent(input: {
  userId: string;
  channel: Channel;
  provider: Provider;
  status: Status;
  externalMessageId?: string | null;
  payload?: unknown;
  errorMessage?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("notification_events")
    .insert({
      user_id: input.userId,
      channel: input.channel,
      provider: input.provider,
      status: input.status,
      external_message_id: input.externalMessageId ?? null,
      payload: input.payload ?? {},
      error_message: input.errorMessage ?? null,
    })
    .select("id")
    .single();

  return result.data?.id ?? null;
}

export async function updateNotificationEvent(eventId: string, input: { status: Status; externalMessageId?: string | null; payload?: unknown; errorMessage?: string | null }) {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from("notification_events")
    .update({
      status: input.status,
      external_message_id: input.externalMessageId ?? null,
      payload: input.payload ?? {},
      error_message: input.errorMessage ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);
}

export async function updateNotificationByExternalId(input: { provider: Provider; externalMessageId: string; status: Status; payload?: unknown }) {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from("notification_events")
    .update({
      status: input.status,
      payload: input.payload ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq("provider", input.provider)
    .eq("external_message_id", input.externalMessageId);
}
