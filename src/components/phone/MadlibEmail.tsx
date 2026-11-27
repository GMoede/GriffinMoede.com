"use client";

import React, { FC, FormEvent, ReactElement, useMemo, useState } from "react";
import { EMAIL_TEMPLATE, SENDER_NAMES, parseTemplate } from "./emailTemplate";

const CUSTOM = "Custom";

type Props = {
  // Called from the "Back to the room" button once it's sent.
  onDone: () => void;
};

// The email with blanks for the visitor to fill in, Mad Libs style. Sending
// saves it on the site for the admin page.
const MadlibEmail: FC<Props> = ({ onDone }): ReactElement => {
  const parts = useMemo(() => parseTemplate(EMAIL_TEMPLATE), []);
  const blanks = parts.filter((p) => p.kind == "blank");
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ""));
  const [sender, setSender] = useState("");
  const [customSender, setCustomSender] = useState("");
  // Bots fill in every box, including this hidden one.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"editing" | "sending" | "sent" | "error">("editing");
  const [error, setError] = useState("");

  const from = sender == CUSTOM ? customSender.trim() : sender;
  const complete = values.every((v) => v.trim()) && !!from;

  const finishedText = () =>
    parts
      .map((p) =>
        p.kind == "text" ? p.text : p.kind == "blank" ? values[p.index].trim() : from
      )
      .join("");

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!complete || status == "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          text: finishedText(),
          fields: blanks.map((b, i) => ({
            label: b.kind == "blank" ? b.label : "",
            value: values[i].trim(),
          })),
          website,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error);
      setStatus("sent");
    } catch (err) {
      setError((err as Error).message || "");
      setStatus("error");
    }
  };

  if (status == "sent") {
    return (
      <div className="madlib-email madlib-sent">
        <h2>Sent!</h2>
        <p>In case of emergency, he can also be reached through extreme focus.</p>
        <button type="button" className="madlib-primary" onClick={onDone}>
          Back to the room
        </button>
      </div>
    );
  }

  return (
    <form className="madlib-email" onSubmit={send}>
      <h2>The special email form</h2>
      <p className="madlib-hint">Fill in the blanks.</p>

      <div className="madlib-letter">
        {parts.map((p, i) => {
          if (p.kind == "text") return <span key={i}>{p.text}</span>;
          if (p.kind == "blank") {
            const value = values[p.index];
            return (
              <input
                key={i}
                className="madlib-blank"
                placeholder={p.label}
                aria-label={p.label}
                value={value}
                maxLength={200}
                // Grow with what's typed, never narrower than the label.
                size={Math.max(p.label.length, value.length, 4)}
                onChange={(e) =>
                  setValues((vs) => vs.map((v, j) => (j == p.index ? e.target.value : v)))
                }
              />
            );
          }
          return (
            <span key={i} className="madlib-sender">
              <select
                className="madlib-blank"
                aria-label="Your name"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              >
                <option value="" disabled>
                  Name
                </option>
                {SENDER_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value={CUSTOM}>{CUSTOM}</option>
              </select>
              {sender == CUSTOM && (
                <input
                  className="madlib-blank"
                  placeholder="Your name"
                  aria-label="Your name"
                  value={customSender}
                  maxLength={100}
                  size={Math.max(customSender.length, 9)}
                  autoFocus
                  onChange={(e) => setCustomSender(e.target.value)}
                />
              )}
            </span>
          );
        })}
      </div>

      <input
        className="madlib-trap"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      {status == "error" && (
        <p className="madlib-error">{error || "Couldn't send it. Try again in a moment."}</p>
      )}

      <div className="madlib-actions">
        <button type="submit" className="madlib-primary" disabled={!complete || status == "sending"}>
          {status == "sending" ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
};

export default MadlibEmail;
