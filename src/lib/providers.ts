import { getServerEnv } from "@/lib/env";

type ProviderResponse = {
  externalMessageId: string | null;
  payload: unknown;
};

export async function sendBrevoConfirmationEmail(email: string, firstName: string) {
  const env = getServerEnv();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": env.brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
      to: [{ email }],
      subject: "Welcome to TaskGH Early Access 🎉",
      htmlContent: buildBrandedWaitlistEmail(firstName, env.emailLogoUrl),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email failed: ${errorText}`);
  }

  const payload = (await response.json().catch(() => null)) as { messageId?: string } | null;
  return {
    externalMessageId: payload?.messageId ?? null,
    payload,
  } satisfies ProviderResponse;
}

export async function sendFlashSmsConfirmation(phoneNumber: string, firstName: string) {
  const env = getServerEnv();
  // Ensure phone is clean (strip + for the gateway)
  const cleanPhone = phoneNumber.replace("+", "");
  const message = `Hi ${firstName}, thanks for joining the TaskGH waitlist. We’ll notify you when we launch. Trusted artisans on demand.`;
  
  const response = await fetch("https://app.flashsms.africa/api/v1/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.flashSmsApiKey}`,
    },
    body: JSON.stringify({
      senderId: env.flashSmsSenderId,
      recipients: [cleanPhone],
      message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FlashSMS send failed: ${errorText}`);
  }

  const payload = (await response.json().catch(() => null)) as { 
    success: boolean; 
    data?: { messageId: string };
    error?: string;
  } | null;

  if (payload?.success === false) {
    throw new Error(`FlashSMS API Error: ${payload.error || "Unknown error"}`);
  }

  return {
    externalMessageId: payload?.data?.messageId ?? null,
    payload,
  } satisfies ProviderResponse;
}

function buildBrandedWaitlistEmail(firstName: string, logoUrl?: string) {
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="TaskGH" style="height:36px;width:auto;" />`
    : `<div style="font-size:24px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">TaskGH</div>`;
  return `
  <div style="background:#f8fafc;padding:24px;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#2563eb;padding:20px 24px;color:#ffffff;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${logo}
        </div>
        <p style="margin:8px 0 0;font-size:13px;opacity:0.95;">Trusted Artisans, On Demand</p>
      </div>
      <div style="padding:24px;color:#0f172a;line-height:1.7;">
        <p style="margin:0 0 12px;">Hi ${firstName},</p>
        <p style="margin:0 0 12px;">Thanks for joining the TaskGH waitlist.</p>
        <p style="margin:0 0 12px;">You’ll be among the first to access trusted plumbers, electricians, AC technicians and more.</p>
        <p style="margin:0;">We’ll notify you before launch.</p>
      </div>
      <div style="padding:16px 24px;background:#f1f5f9;color:#334155;font-size:12px;">
        <p style="margin:0 0 6px;font-weight:600;">TaskGH</p>
        <p style="margin:0;">Trusted Artisans, On Demand</p>
      </div>
    </div>
  </div>
`;
}
