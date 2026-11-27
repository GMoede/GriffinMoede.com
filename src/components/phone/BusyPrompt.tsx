"use client";

import React, { FC, MouseEvent, ReactElement, useEffect, useRef, useState } from "react";

// How long the fake cursor takes to glide from No over to Yes, in ms.
const GLIDE_MS = 900;
// How long it holds the press on Yes before letting go, in ms.
const PRESS_MS = 220;

type Props = {
  onYes: () => void;
};

// Asks whether the visitor wants the special email form after Griffin hangs
// up. "No" isn't really an option: the page can't move the real mouse, so it
// hides it and slides a drawn cursor from No over to Yes, then clicks Yes.
const BusyPrompt: FC<Props> = ({ onYes }): ReactElement => {
  const yesButton = useRef<HTMLButtonElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  // Where the drawn cursor starts; null until No is clicked.
  const [hijackFrom, setHijackFrom] = useState<{ x: number; y: number } | null>(null);
  const [pressing, setPressing] = useState(false);

  useEffect(() => {
    if (!hijackFrom || !yesButton.current || !cursor.current) return;
    const yes = yesButton.current.getBoundingClientRect();
    const to = { x: yes.left + yes.width * 0.55, y: yes.top + yes.height * 0.6 };
    const from = hijackFrom;
    // Arc up a little on the way over, like a hand moving the mouse.
    const lift = Math.min(80, Math.abs(to.x - from.x) * 0.25);
    const start = performance.now();
    let frame = 0;
    let pressTimer: ReturnType<typeof setTimeout>;

    const step = (now: number) => {
      const t = Math.min((now - start) / GLIDE_MS, 1);
      // Ease in and out.
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const x = from.x + (to.x - from.x) * e;
      const y = from.y + (to.y - from.y) * e - Math.sin(Math.PI * e) * lift;
      cursor.current!.style.transform = `translate(${x}px, ${y}px)`;
      if (t < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      setPressing(true);
      pressTimer = setTimeout(() => {
        setPressing(false);
        onYes();
      }, PRESS_MS);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(pressTimer);
    };
  }, [hijackFrom]);

  const clickNo = (e: MouseEvent) => {
    if (hijackFrom) return;
    // A keyboard press has no mouse position; start from the No button.
    const r = e.currentTarget.getBoundingClientRect();
    const fromMouse = e.clientX || e.clientY;
    setHijackFrom(
      fromMouse ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    );
  };

  return (
    <div className={`busy-prompt${hijackFrom ? " hijacked" : ""}`}>
      <div className="busy-card" role="dialog" aria-labelledby="busy-message">
        <p id="busy-message">
          Griffin is super busy right now. Would you like the special email form?
        </p>
        <div className="busy-actions">
          <button
            ref={yesButton}
            className={`busy-yes${pressing ? " pressed" : ""}`}
            onClick={() => !hijackFrom && onYes()}
          >
            Yes
          </button>
          <button className="busy-no" onClick={clickNo}>
            No
          </button>
        </div>
      </div>
      {hijackFrom && (
        <div
          ref={cursor}
          className={`fake-cursor${pressing ? " pressed" : ""}`}
          style={{ transform: `translate(${hijackFrom.x}px, ${hijackFrom.y}px)` }}
          aria-hidden="true"
        >
          {/* A standard arrow pointer, tip at the top-left corner. */}
          <svg width="22" height="32" viewBox="0 0 22 32">
            <path
              d="M1 1 L1 25 L7 19.5 L11 29 L15 27.3 L11 18 L19 18 Z"
              fill="white"
              stroke="black"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BusyPrompt;
