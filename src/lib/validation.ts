import { z } from "zod";

const ghanaPhoneRegex = /^(?:\+233|0)(?:2[03456789]|5[0-9])[0-9]{7}$/;

export function normalizeGhanaPhone(input: string): string {
  const cleaned = input.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("+233")) {
    return cleaned;
  }
  if (cleaned.startsWith("233")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+233${cleaned.slice(1)}`;
  }
  return cleaned;
}

export const waitlistSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.email("Please enter a valid email").transform((value) => value.toLowerCase()),
  phoneNumber: z
    .string()
    .trim()
    .transform((value) => normalizeGhanaPhone(value))
    .refine((value) => ghanaPhoneRegex.test(value), "Please enter a valid Ghana phone number"),
  source: z.string().trim().max(100).optional(),
  referralCode: z.string().trim().max(100).optional(),
  hpField: z.string().max(0).optional(),
});

export type WaitlistPayload = z.infer<typeof waitlistSchema>;
