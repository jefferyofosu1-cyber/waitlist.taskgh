import { getServerEnv } from "@/lib/env";

export async function sendBrevoConfirmationEmail(email: string, firstName: string) {
  const env = getServerEnv();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": env.brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: "TaskGH", email: "hello@taskgh.com" },
      to: [{ email }],
      subject: "Welcome to TaskGH Early Access 🎉",
      htmlContent: `
        <div style="font-family: Inter, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <p>Hi ${firstName},</p>
          <p>Thanks for joining the TaskGH waitlist.</p>
          <p>You’ll be among the first to access trusted plumbers, electricians, AC technicians and more.</p>
          <p>We’ll notify you before launch.</p>
          <p style="margin-top: 24px;">TaskGH<br/>Trusted Artisans, On Demand</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email failed: ${errorText}`);
  }
}

export async function sendFlashSmsConfirmation(phoneNumber: string, firstName: string) {
  const env = getServerEnv();
  const message = `Hi ${firstName}, thanks for joining the TaskGH waitlist. We’ll notify you when we launch. Trusted artisans on demand.`;
  const response = await fetch("https://api.flashsmsgh.com/api/v3/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.flashSmsApiKey}`,
    },
    body: JSON.stringify({
      sender: env.flashSmsSenderId,
      recipients: [phoneNumber],
      message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FlashSMS send failed: ${errorText}`);
  }
}
