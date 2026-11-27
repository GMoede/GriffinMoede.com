// Sign-in for the admin page. There's one admin, with the password in the
// ADMIN_PASSWORD environment variable (set it in Vercel's project settings,
// and in .env.local for local development). Server-only.
//
// Signing in sets a cookie holding a signature made with the password, so
// changing the password signs every browser out.

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
// How long a sign-in lasts, in seconds.
export const SESSION_LENGTH = 60 * 60 * 24 * 7;

const password = () => process.env.ADMIN_PASSWORD || "";

const sign = (value: string) =>
  createHmac("sha256", password()).update(value).digest("hex");

const sameText = (a: string, b: string) => {
  // Compare fixed-length digests so the time taken doesn't hint at the answer.
  const ha = createHmac("sha256", "compare").update(a).digest();
  const hb = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export const adminConfigured = () => password().length > 0;

export const checkPassword = (attempt: string) =>
  adminConfigured() && sameText(attempt, password());

// The cookie: when it expires, and a signature over that.
export const makeSession = () => {
  const expires = Date.now() + SESSION_LENGTH * 1000;
  return `${expires}.${sign(`admin:${expires}`)}`;
};

export const isAdmin = async () => {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return sameText(signature, sign(`admin:${expires}`));
};
