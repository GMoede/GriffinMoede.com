import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_LENGTH,
  adminConfigured,
  checkPassword,
  makeSession,
} from "../../../../server/adminAuth";

// Sign in: { password } in the body.
export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD isn't set." }, { status: 503 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password != "string" || !checkPassword(password)) {
    // A short pause makes guessing passwords slow.
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_LENGTH,
  });
  return res;
}

// Sign out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
