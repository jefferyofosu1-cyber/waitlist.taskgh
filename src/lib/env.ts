type RequiredServerVar =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "BREVO_API_KEY"
  | "BREVO_SENDER_EMAIL"
  | "BREVO_SENDER_NAME"
  | "FLASHSMS_API_KEY"
  | "FLASHSMS_SENDER_ID";

function readRequiredServerVar(key: RequiredServerVar): string {
  const value = process.env[key];
  if (!value) {
    // During build phase, some secrets might be missing. We allow this to let the build finish.
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || process.env.CI === "true";
    if (isBuildPhase) {
      return "";
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getServerEnv() {
  return {
    supabaseUrl: readRequiredServerVar("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseServiceRoleKey: readRequiredServerVar("SUPABASE_SERVICE_ROLE_KEY"),
    brevoApiKey: readRequiredServerVar("BREVO_API_KEY"),
    brevoSenderEmail: readRequiredServerVar("BREVO_SENDER_EMAIL"),
    brevoSenderName: readRequiredServerVar("BREVO_SENDER_NAME"),
    flashSmsApiKey: readRequiredServerVar("FLASHSMS_API_KEY"),
    flashSmsSenderId: readRequiredServerVar("FLASHSMS_SENDER_ID"),
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
    webhookSecret: process.env.NOTIFICATION_WEBHOOK_SECRET,
    emailLogoUrl: process.env.EMAIL_LOGO_URL,
  };
}
