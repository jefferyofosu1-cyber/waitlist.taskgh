export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function getClientIpHeaderValue(forwardedFor: string | null): string | null {
  if (!forwardedFor) {
    return null;
  }
  const first = forwardedFor.split(",")[0]?.trim();
  return first || null;
}

export function generateReferralCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}
