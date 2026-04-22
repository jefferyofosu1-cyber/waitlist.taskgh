import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

export type WaitlistUser = {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  source: string | null;
  referral_code: string | null;
  referred_by_code: string | null;
  ip_address: string | null;
  created_at: string;
};

export function getSupabaseAdminClient() {
  const env = getServerEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
