"use client";

import React, { FC, ReactElement, useEffect, useRef, useState } from "react";

// The words the visitor can string together into a reply. They're shuffled
// into a new order when the panel opens and again after every word picked.
export const RESPONSE_WORDS = [
  "Fart",
  "Love",
  "I",
  "A",
  "Like",
  "Want",
  "Costco Hotdog",
  "Nugget",
  "Am",
  "For",
  "To",
  "Job",
  "Synergy",
  "Cut-throat",
  "Farty",
  "Cheese",
  "Muffin",
  "!",
  "?",
  "Sometimes I just wish",
  "Hello",
  "Do you understand me?",
];

// Punctuation sticks to the word before it instead of getting its own space.
const PUNCTUATION = new Set(["!", "?", ".", ","]);
const joinWords = (words: string[]) =>
  words.reduce(
    (text, word) => (PUNCTUATION.has(word) || !text ? text + word : `${text} ${word}`),
    ""
  );

const shuffled = <T,>(items: T[]) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// SAM's voice settings (0-255). Speed: lower is faster. Pitch: lower is
// higher. Mouth and throat shape the tone.
const SAM_VOICE = { speed: 72, pitch: 64, mouth: 128, throat: 128 };

type SpeakPromise = Promise<true> & { abort: (reason: unknown) => void };

// The right half of the screen once Griffin answers: click words to build a
// sentence, then Respond reads it aloud in SAM's robot voice.
type Props = {
  // Called each time SAM finishes reading a reply aloud.
  onResponded?: () => void;
};

const ResponsePanel: FC<Props> = ({ onResponded }): ReactElement => {
  const [words, setWords] = useState(() => shuffled(RESPONSE_WORDS));
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
      speech.current = new SamJs(SAM_VOICE).speak(joinWords(chosen)) as SpeakPromise;
      await speech.current;
      // Sent: empty the box for the next reply.
      setChosen([]);
      onResponded?.();
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
        {words.map((word, i) => (
          <button
            key={i}
            className="response-word"
            onClick={() => {
              setChosen((c) => [...c, word]);
              setWords(shuffled(RESPONSE_WORDS));
            }}
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
