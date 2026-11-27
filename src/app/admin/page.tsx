"use client";

import React, { FC, FormEvent, ReactElement, useEffect, useState } from "react";
import "../styles/pages/admin.css";

type Message = {
  id: string;
  createdAt: number;
  from: string;
  text: string;
};

type Usage = { used: number; max: number };

const formatBytes = (n: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
};

// Messages sent from the phone page's email form. Sign in with the
// ADMIN_PASSWORD set on the server.
const AdminPage: FC = (): ReactElement => {
  const [state, setState] = useState<"loading" | "signedOut" | "signedIn">("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch("/api/messages", { cache: "no-store" });
    if (res.status == 401) return setState("signedOut");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Couldn't load messages.");
      return setState("signedIn");
    }
    setMessages(data.messages);
    setUsage(data.usage);
    setError("");
    setState("signedIn");
  };

  useEffect(() => {
    load();
  }, []);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) return setError((await res.json()).error || "Couldn't sign in.");
    setPassword("");
    await load();
  };

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setMessages([]);
    setState("signedOut");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message? This can't be undone.")) return;
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    else setError("Couldn't delete that message.");
  };

  if (state == "loading") {
    return <div className="admin-page">Loading…</div>;
  }

  if (state == "signedOut") {
    return (
      <div className="admin-page">
        <form className="admin-signin" onSubmit={signIn}>
          <h1>Admin</h1>
          <label>
            Password
            <input
              type="password"
              value={password}
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" disabled={busy || !password}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Messages</h1>
        {usage && (
          <span className="admin-usage">
            {messages.length} saved · {formatBytes(usage.used)} of {formatBytes(usage.max)}
          </span>
        )}
        <button onClick={load}>Refresh</button>
        <button onClick={signOut}>Sign out</button>
      </header>
      {error && <p className="admin-error">{error}</p>}
      {!messages.length && !error && <p className="admin-empty">No messages yet.</p>}
      <ul className="admin-messages">
        {messages.map((m) => (
          <li key={m.id} className="admin-message">
            <div className="admin-message-meta">
              <strong>{m.from}</strong>
              <time dateTime={new Date(m.createdAt).toISOString()}>
                {new Date(m.createdAt).toLocaleString()}
              </time>
              <button onClick={() => remove(m.id)}>Delete</button>
            </div>
            <p className="admin-message-text">{m.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
