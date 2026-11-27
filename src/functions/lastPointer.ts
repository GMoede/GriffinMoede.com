// The cursor's last known position in the window, kept across client-side
// page changes so a new page can start things (like the phone page's arm)
// right where the cursor already is. Null until the cursor has moved or
// clicked since the site loaded.
let lastPointer: { x: number; y: number } | null = null;

if (typeof window !== "undefined") {
  const remember = (e: PointerEvent) => {
    lastPointer = { x: e.clientX, y: e.clientY };
  };
  window.addEventListener("pointermove", remember, { passive: true });
  window.addEventListener("pointerdown", remember, { passive: true });
}

export const getLastPointer = () => lastPointer;
