import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";

const COOKIE_NAME = "taskgh_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = getServerEnv().adminSessionSecret;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encode(payload: string) {
  const signature = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function decode(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = sign(payload);
  const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return null;
  }
  return payload;
}

export function isValidAdminToken(token?: string) {
  if (!token) {
    return false;
  }
  const decoded = decode(token);
  if (!decoded) {
    return false;
  }
  const parsed = JSON.parse(decoded) as { expiresAt: number };
  return parsed.expiresAt > Date.now();
}

export async function createAdminSession(username: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = encode(JSON.stringify({ username, expiresAt }));
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return isValidAdminToken(jar.get(COOKIE_NAME)?.value);
}

export async function requireAdminAuth() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }
}
