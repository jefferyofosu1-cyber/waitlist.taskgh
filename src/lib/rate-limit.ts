import { getSupabaseAdminClient } from "@/lib/supabase";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

/**
 * Persistent, cross-instance rate limiter backed by Supabase.
 * Falls back to allowing the request on any database error.
 */
export async function isRateLimited(key: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient();
    const windowCutoff = new Date(Date.now() - WINDOW_MS).toISOString();

    const { data } = await supabase
      .from("rate_limits")
      .select("count, window_start")
      .eq("key", key)
      .maybeSingle();

    if (!data || data.window_start < windowCutoff) {
      // No record or window expired — start a fresh window
      await supabase
        .from("rate_limits")
        .upsert(
          { key, count: 1, window_start: new Date().toISOString() },
          { onConflict: "key" },
        );
      return false;
    }

    if (data.count >= MAX_REQUESTS) {
      return true;
    }

    await supabase
      .from("rate_limits")
      .update({ count: data.count + 1 })
      .eq("key", key);

    return false;
  } catch {
    // Never block a request due to a rate-limit DB failure
    return false;
  }
}
