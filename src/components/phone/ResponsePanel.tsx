"use client";

import React, { FC, ReactElement, useEffect, useRef, useState } from "react";

// The words the visitor can string together into a reply.
// PLACEHOLDERS: replace these with the real 15 words.
export const RESPONSE_WORDS = [
  "Hey",
  "Griffin",
  "it's",
  "me",
  "I",
  "want",
  "to",
  "hire",
  "you",
  "for",
  "a",
  "job",
  "call",
  "back",
  "please",
];

// SAM's voice settings (0-255). Speed: lower is faster. Pitch: lower is
// higher. Mouth and throat shape the tone.
const SAM_VOICE = { speed: 72, pitch: 64, mouth: 128, throat: 128 };

type SpeakPromise = Promise<true> & { abort: (reason: unknown) => void };

// The right half of the screen once Griffin answers: click words to build a
// sentence, then Respond reads it aloud in SAM's robot voice.
const ResponsePanel: FC = (): ReactElement => {
  const [chosen, setChosen] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const speech = useRef<SpeakPromise | null>(null);

  // Stop talking if the panel goes away (Replay, Back).
  useEffect(() => () => speech.current?.abort("closed"), []);

  const respond = async () => {
    if (!chosen.length || speaking) return;
    setSpeaking(true);
    try {
      // Loaded only when first needed.
      const { default: SamJs } = await import("sam-js");
      speech.current = new SamJs(SAM_VOICE).speak(chosen.join(" ")) as SpeakPromise;
      await speech.current;
    } catch {
      // Aborted or the browser blocked audio; nothing to do.
    } finally {
      speech.current = null;
      setSpeaking(false);
    }
  };

  return (
    <div className="response-panel">
      <h2 className="response-title">Your response</h2>

      <div className="response-sentence" aria-live="polite">
        {chosen.length ? (
          chosen.map((word, i) => (
            <button
              key={i}
              className="response-chosen"
              title="Remove this word"
              onClick={() => setChosen((c) => c.filter((_, j) => j != i))}
            >
              {word}
            </button>
          ))
        ) : (
          <span className="response-hint">Pick words below to build a reply.</span>
        )}
      </div>

      <div className="response-words">
        {RESPONSE_WORDS.map((word, i) => (
          <button
            key={i}
            className="response-word"
            onClick={() => setChosen((c) => [...c, word])}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="response-actions">
        <button
          className="response-secondary"
          disabled={!chosen.length || speaking}
          onClick={() => setChosen((c) => c.slice(0, -1))}
        >
          Undo
        </button>
        <button
          className="response-secondary"
          disabled={!chosen.length || speaking}
          onClick={() => setChosen([])}
        >
          Clear
        </button>
        <button
          className="response-respond"
          disabled={!chosen.length || speaking}
          onClick={respond}
        >
          {speaking ? "Speaking…" : "Respond"}
        </button>
      </div>
    </div>
  );
};

export default ResponsePanel;
