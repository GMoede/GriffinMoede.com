// Saves the messages visitors send from the phone page's email form, and
// reads them back for the admin page. Server-only.
//
// In production the messages live in an Upstash Redis database (add one to
// the Vercel project under Storage; Vercel sets KV_REST_API_URL and
// KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).
// Without one, during local development they're kept in .data/messages.json.
//
// Storage is capped at MAX_BYTES: once a new message would go over, the
// oldest messages are deleted until it fits.

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type Message = {
  id: string;
  // Milliseconds since 1970.
  createdAt: number;
  // Who it says it's from (the name picked at the bottom of the email).
  from: string;
  // The finished email, blanks filled in.
  text: string;
  // Each blank's label and what the visitor typed, in order.
  fields: { label: string; value: string }[];
};

// 1 GB by default; MESSAGES_MAX_BYTES overrides it (e.g. to fit a smaller
// database plan).
const MAX_BYTES = Number(process.env.MESSAGES_MAX_BYTES) || 1024 ** 3;

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Redis keys: a sorted set of ids by time, one key per message, and a
// running total of stored bytes.
const INDEX = "messages:index";
const BYTES = "messages:bytes";
const key = (id: string) => `messages:item:${id}`;

const byteSize = (s: string) => Buffer.byteLength(s, "utf8");

export class StorageNotConfigured extends Error {}

// ---- Redis (production) -----------------------------------------------------

type Command = (string | number)[];

const redis = async (commands: Command[]): Promise<unknown[]> => {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis request failed: ${res.status}`);
  const replies = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = replies.find((r) => r.error);
  if (failed) throw new Error(`Redis error: ${failed.error}`);
  return replies.map((r) => r.result);
};

const redisStore = {
  async add(message: Message) {
    const json = JSON.stringify(message);
    const [, , total] = await redis([
      ["SET", key(message.id), json],
      ["ZADD", INDEX, message.createdAt, message.id],
      ["INCRBY", BYTES, byteSize(json)],
    ]);
    let bytes = Number(total);
    // Over the cap: drop the oldest messages until it fits. Never drops the
    // one just added.
    while (bytes > MAX_BYTES) {
      const [oldest] = (await redis([["ZRANGE", INDEX, 0, 0]]))[0] as string[];
      if (!oldest || oldest == message.id) break;
      bytes = await redisStore.remove(oldest);
    }
  },

  async list(): Promise<Message[]> {
    const [ids] = (await redis([["ZRANGE", INDEX, 0, -1, "REV"]])) as string[][];
    if (!ids.length) return [];
    const [items] = (await redis([["MGET", ...ids.map(key)]])) as (string | null)[][];
    return items.filter(Boolean).map((s) => JSON.parse(s) as Message);
  },

  // Deletes one message; returns the bytes still stored.
  async remove(id: string): Promise<number> {
    const [json] = (await redis([["GET", key(id)]])) as (string | null)[];
    const size = json ? byteSize(json) : 0;
    const [, , total] = await redis([
      ["DEL", key(id)],
      ["ZREM", INDEX, id],
      ["DECRBY", BYTES, size],
    ]);
    return Number(total);
  },

  async usage() {
    const [total] = await redis([["GET", BYTES]]);
    return Number(total) || 0;
  },
};

// ---- File (local development) ----------------------------------------------

const FILE = path.join(process.cwd(), ".data", "messages.json");

const readFile = async (): Promise<Message[]> => {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
};

const writeFile = async (messages: Message[]) => {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(messages, null, 2));
};

const sizeOf = (messages: Message[]) =>
  messages.reduce((n, m) => n + byteSize(JSON.stringify(m)), 0);

const fileStore = {
  async add(message: Message) {
    // Kept oldest first.
    const messages = [...(await readFile()), message];
    while (messages.length > 1 && sizeOf(messages) > MAX_BYTES) messages.shift();
    await writeFile(messages);
  },
  async list() {
    return (await readFile()).reverse();
  },
  async remove(id: string) {
    const messages = (await readFile()).filter((m) => m.id != id);
    await writeFile(messages);
    return sizeOf(messages);
  },
  async usage() {
    return sizeOf(await readFile());
  },
};

// ---- Public API -------------------------------------------------------------

const store = () => {
  if (REDIS_URL && REDIS_TOKEN) return redisStore;
  // Vercel's file system doesn't keep files, so don't pretend to save there.
  if (process.env.VERCEL) throw new StorageNotConfigured("No message database is set up.");
  return fileStore;
};

export const saveMessage = async (m: Omit<Message, "id" | "createdAt">) => {
  const message: Message = { ...m, id: randomUUID(), createdAt: Date.now() };
  await store().add(message);
  return message;
};

// Newest first.
export const listMessages = () => store().list();

export const deleteMessage = async (id: string) => {
  await store().remove(id);
};

export const storageUsage = async () => ({ used: await store().usage(), max: MAX_BYTES });
