import { getSupabaseAdminClient } from "./supabase";
import { headers } from "next/headers";
import { getClientIpHeaderValue } from "./utils";

export async function recordPageView(path: string) {
  try {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent");
    const referrer = headerList.get("referer");
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = getClientIpHeaderValue(forwardedFor);

    const supabase = getSupabaseAdminClient();
    
    // Fire and forget or await? Usually better to await in server components to avoid edge cases, 
    // but can be backgrounded if performance is critical.
    await supabase.from("page_views").insert({
      path,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
    });
  } catch (error) {
    console.error("Failed to record page view:", error);
  }
}
