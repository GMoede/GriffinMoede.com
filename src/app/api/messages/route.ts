import { NextRequest, NextResponse } from "next/server";
import {
  StorageNotConfigured,
  listMessages,
  saveMessage,
  storageUsage,
} from "../../../server/messages";
import { isAdmin } from "../../../server/adminAuth";

// Limits on what a visitor can send, so one message can't eat the storage.
const MAX_FIELDS = 60;
const MAX_FIELD_LENGTH = 1000;
const MAX_TEXT_LENGTH = 20000;

const clip = (v: unknown, max: number) => (typeof v == "string" ? v.trim().slice(0, max) : "");

const storageError = (e: unknown) =>
  e instanceof StorageNotConfigured
    ? NextResponse.json({ error: "Messages can't be saved right now." }, { status: 503 })
    : NextResponse.json({ error: "Something went wrong." }, { status: 500 });

// A visitor sends the filled-in email.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body != "object") {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  // Hidden from people; bots that fill every box fill this one too.
  if (body.website) return NextResponse.json({ ok: true });

  const fields = Array.isArray(body.fields)
    ? body.fields.slice(0, MAX_FIELDS).map((f: { label?: unknown; value?: unknown }) => ({
        label: clip(f?.label, 100),
        value: clip(f?.value, MAX_FIELD_LENGTH),
      }))
    : [];
  const from = clip(body.from, 100);
  const text = clip(body.text, MAX_TEXT_LENGTH);
  if (!text || !from) {
    return NextResponse.json({ error: "The email is missing." }, { status: 400 });
  }

  try {
    await saveMessage({ from, text, fields });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Saving message failed:", e);
    return storageError(e);
  }
}

// The admin page reads every message, newest first.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const [messages, usage] = await Promise.all([listMessages(), storageUsage()]);
    return NextResponse.json({ messages, usage });
  } catch (e) {
    console.error("Listing messages failed:", e);
    return storageError(e);
  }
}
