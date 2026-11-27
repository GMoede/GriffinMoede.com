"use client";

import React, {
  FC,
  ReactElement,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "../../app/styles/components/phone.css";
import { getLastPointer } from "../../functions/lastPointer";
import { playThroughPhone, PhoneVoice } from "./phoneAudio";
// three.js is only downloaded once someone dials the secret number.
const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false });
const ResponsePanel = dynamic(() => import("./ResponsePanel"), { ssr: false });
const BusyPrompt = dynamic(() => import("./BusyPrompt"), { ssr: false });
const MadlibEmail = dynamic(() => import("./MadlibEmail"), { ssr: false });

// The number printed on the phone. Dialing it fades the screen to black and
// shows the 3D model.
const SECRET_NUMBER = "5039544333";
// How long the screen takes to fade to black, in ms. Keep in sync with
// .secret-overlay in phone.css.
const FADE_MS = 1500;
// Recordings played in order once he has the phone to his ear. Each one is run
// through the telephone effect in phoneAudio.ts, so add clean recordings here.
const CALL_AUDIO = ["/Phone/audio/call/this-is-griffin.m4a"];
// His ringtone: fades in with the black screen, through the same telephone
// effect, and stops when he presses answer.
const RINGTONE = "/Phone/audio/call/ringtone.m4a";
// What he says after each of the visitor's replies, in order: the first line
// after the first reply, and so on. Clean recordings; the telephone effect is
// added when they play. After the last one he lowers the phone and hangs up,
// the call fades to black, and the visitor is offered the email form.
const REPLIES = [
  "/Phone/audio/call/ok-so-whats-up.m4a",
  "/Phone/audio/call/i-gotta-go.m4a",
];

type phoneState = "hungUp" | "unhooked" | "pressing";
type dialingState =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | "pound"
  | "star"
  | null;

// Images the page swaps in once you pick up the phone or press a key. They're
// loaded when the page opens so they're ready to draw the moment they're
// needed, instead of leaving a blank frame while they download.
const LATER_IMAGES = [
  "/arm_pointing_pixellated.png",
  "/arm_holding_pixellated.png",
  "/Phone/phone_unhooked.png",
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "pound", "star"].map(
    (key) => `/Phone/phone_pressing_${key}.png`
  ),
];

const Phone: FC = (): ReactElement => {
  // A zero-size box that sits on the cursor; the arm hangs off it, so rotating
  // this box pivots the arm around the cursor.
  const Hand = useRef<HTMLDivElement>(null);
  const [phoneState, setPhoneState] = useState<phoneState>("hungUp");
  const [dialingState, setDialingState] = useState<dialingState>(null);
  // Keys pressed since the phone was last picked up.
  const dialed = useRef("");
  // "fading" while the screen goes black, "model" once the model is shown.
  const [secretState, setSecretState] = useState<null | "fading" | "model">(
    null
  );
  // Bumped by the Replay button; a new key remounts the viewer, which starts
  // the animation (and the voice recording) over from the beginning.
  const [replayCount, setReplayCount] = useState(0);
  // Once he presses answer, the model slides left and the reply panel opens
  // on the right.
  const [answered, setAnswered] = useState(false);
  // How many replies the visitor has sent, and the line he's saying back.
  const [responses, setResponses] = useState(0);
  const [griffinSays, setGriffinSays] = useState<{
    src: string;
    id: number;
    last: boolean;
  } | null>(null);
  const onResponded = () => {
    const n = responses + 1;
    setResponses(n);
    if (REPLIES[n - 1])
      setGriffinSays({ src: REPLIES[n - 1], id: n, last: n == REPLIES.length });
  };
  const router = useRouter();
  // After he hangs up: the call fades out, then "super busy" asks about the
  // email form, then the form itself.
  const [afterCall, setAfterCall] = useState<null | "fading" | "busy" | "email">(null);

  const ringtone = useRef<PhoneVoice | null>(null);
  const stopRinging = () => {
    ringtone.current?.stop();
    ringtone.current = null;
  };
  const startRinging = () => {
    stopRinging();
    ringtone.current = playThroughPhone(RINGTONE, { fadeInMs: FADE_MS, loop: true });
  };
  // Don't leave it ringing after navigating away.
  useEffect(() => stopRinging, []);
  const mousePosition = useRef({ x: 0, y: 0 });
  // Where the hand currently is; it eases toward mousePosition every frame.
  const handPosition = useRef({ x: 0, y: 0 });
  const hasMouseMoved = useRef(false);
  const phoneStateRef = useRef(phoneState);
  phoneStateRef.current = phoneState;

  // How long the hand takes to catch up, in seconds. Higher = smoother, more lag.
  const HAND_SMOOTHING = 0.12;
  // How far the forearm tilts up, in degrees, with the cursor at the very top
  // of the screen. It is 0 at the bottom and grows evenly in between.
  const MAX_ARM_TILT = 45;
  // Extra upward tilt, in degrees, while a phone key is held down.
  const PRESS_TILT = 8;
  // How long the press tilt takes to kick in and to settle back, in seconds.
  // Much shorter than HAND_SMOOTHING so it reacts right away.
  const PRESS_SMOOTHING = 0.04;
  // The press tilt currently applied; eases toward PRESS_TILT or 0.
  const pressTilt = useRef(0);

  // Holds the preloaded images so the browser keeps them decoded in memory.
  const laterImages = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    laterImages.current = LATER_IMAGES.map((src) => {
      const img = new Image();
      img.src = src;
      img.decode().catch(() => {});
      return img;
    });
  }, []);

  // Coming from the room, the cursor is already somewhere on screen: start the
  // arm there, before the first paint, so it neither shows up in the corner
  // nor jumps on the first mouse move.
  useLayoutEffect(() => {
    const pointer = getLastPointer();
    if (!pointer) return;
    hasMouseMoved.current = true;
    mousePosition.current = { ...pointer };
    handPosition.current = { ...pointer };
    setHandPosition(pointer.x, pointer.y);
  }, []);

  useEffect(() => {
    let frame: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      // Frame-rate independent easing: cover the same share of the remaining
      // distance per second whether the screen runs at 60Hz or 144Hz.
      const ease = 1 - Math.exp(-dt / HAND_SMOOTHING);
      const hand = handPosition.current;
      hand.x += (mousePosition.current.x - hand.x) * ease;
      hand.y += (mousePosition.current.y - hand.y) * ease;

      const pressTarget = phoneStateRef.current == "pressing" ? PRESS_TILT : 0;
      const pressEase = 1 - Math.exp(-dt / PRESS_SMOOTHING);
      pressTilt.current += (pressTarget - pressTilt.current) * pressEase;

      setHandPosition(hand.x, hand.y);
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const setHandPosition = (Xposition: number, Yposition: number) => {
    if (!Hand.current) return;
    const holding = phoneStateRef.current != "hungUp";

    const height = window.innerHeight || 1;
    const towardTop = Math.min(Math.max(1 - Yposition / height, 0), 1);
    // The reaching arm's forearm runs down-right from the hand and the pointing
    // arm's runs down-left, so they turn opposite ways to lift the forearm.
    const lift = MAX_ARM_TILT * towardTop + pressTilt.current;
    const tilt = lift * (holding ? 1 : -1);

    Hand.current.style.left = `${Xposition}px`;
    Hand.current.style.top = `${Yposition}px`;
    Hand.current.style.transform = `rotate(${tilt}deg)`;
  };

  // Where each arm image sits relative to the cursor so the fingertips line up.
  // It switches instantly with the image rather than being smoothed.
  const handOffset =
    phoneState == "hungUp" ? { left: -140, top: -140 } : { left: -592, top: 125 };

  // Loops for as long as the phone is off the hook.
  const dialTone = useRef<HTMLAudioElement | null>(null);

  const stopDialTone = () => {
    if (!dialTone.current) return;
    dialTone.current.pause();
    dialTone.current.currentTime = 0;
  };

  // Don't leave the tone playing after navigating away from the page.
  useEffect(() => stopDialTone, []);

  const grabPhone = (e: React.MouseEvent) => {
    if (phoneState == "hungUp") {
      new Audio("/Phone/audio/pick-up.mp3").play().catch(() => {});
      dialTone.current ??= Object.assign(new Audio("/Phone/audio/dial-tone.mp3"), {
        loop: true,
      });
      dialTone.current.play().catch(() => {});
      dialed.current = "";
      setPhoneState("unhooked");
    } else {
      stopDialTone();
      setPhoneState("hungUp");
    }
  };

  // Listens on the whole window, not just the phone area, so the hand keeps
  // following the cursor over the Back button too.
  useEffect(() => {
    window.addEventListener("mousemove", moveHand);
    return () => window.removeEventListener("mousemove", moveHand);
  }, []);

  const moveHand = (e: MouseEvent) => {
    const Xposition = e.clientX;
    const Yposition = e.clientY;
    mousePosition.current.x = Xposition;
    mousePosition.current.y = Yposition;

    // Start the hand at the cursor instead of gliding in from the corner.
    if (!hasMouseMoved.current) {
      hasMouseMoved.current = true;
      handPosition.current.x = Xposition;
      handPosition.current.y = Yposition;
    }
  };

  const pressKeyDown = (e: React.MouseEvent) => {
    const keyElement = e.currentTarget as HTMLDivElement;
    let key: string | number = keyElement.dataset.key;

    // Like a real phone, the dial tone ends once you start dialing.
    stopDialTone();
    const sound = new Audio(`/Phone/audio/key${key}.mp3`);
    sound.play();
    setPhoneState("pressing");
    setDialingState(key as dialingState);

    dialed.current = (dialed.current + key).slice(-SECRET_NUMBER.length);
    if (dialed.current == SECRET_NUMBER && !secretState) {
      dialed.current = "";
      setSecretState("fading");
      startRinging();
    }
  };

  // Once the screen is fully black, bring in the model.
  useEffect(() => {
    if (secretState != "fading") return;
    const timer = setTimeout(() => setSecretState("model"), FADE_MS);
    return () => clearTimeout(timer);
  }, [secretState]);

  const keyUp = () => {
    setPhoneState("unhooked");
    setDialingState(null);
  };

  // Releasing the mouse off the key (after dragging away) also ends the press,
  // so the arm never stays tilted and the key never stays drawn pressed.
  useEffect(() => {
    if (phoneState != "pressing") return;
    window.addEventListener("mouseup", keyUp);
    return () => window.removeEventListener("mouseup", keyUp);
  }, [phoneState]);

  const handSource =
    phoneState == "hungUp"
      ? "/arm_reaching_pixellated.png"
      : "/arm_pointing_pixellated.png";

  const handClass = phoneState == "hungUp" ? "hand-reaching" : "hand-pointing";

  let phoneSource;
  if (phoneState == "pressing") {
    phoneSource = `/Phone/phone_pressing_${dialingState}.png`;
  } else {
    phoneSource = `/Phone/phone_${phoneState}.png`;
  }

  const buttonOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, "star", 0, "pound"];

  const buttons = buttonOptions.map((button) => {
    return (
      <div
        className="phone-key-click-box"
        id={`phone-key-${button}`}
        key={button}
        data-key={button}
        onMouseDown={pressKeyDown}
        onMouseUp={keyUp}
      ></div>
    );
  });

  return (
    <div className="phone-and-stand">
      <div ref={Hand} className="hand-pivot">
        <img src={handSource} alt="" className={handClass} style={handOffset} />
      </div>
      <div className="phone-keys-container">{buttons}</div>

      <div className="phone-container">
        <img className="phone" src={phoneSource} alt="" />
        <div className="phone-click-box" onClick={grabPhone}></div>
      </div>
      <img
        className="nightstand"
        src="/NightstandWithPhone/Nightstand.webp"
        alt=""
        loading="eager"
        decoding="sync"
      />

      {secretState && (
        <div className="secret-overlay">
          {secretState == "model" && (
            <>
              <div
                className={`secret-call${afterCall ? " ended" : ""}`}
                onTransitionEnd={(e) => {
                  if (e.target == e.currentTarget && afterCall == "fading")
                    setAfterCall("busy");
                }}
              >
                <div className={`secret-stage${answered ? " answered" : ""}`}>
                  <ModelViewer
                    key={replayCount}
                    src="/Phone/model/griffin.glb"
                    voiceSrcs={CALL_AUDIO}
                    onAnswer={() => {
                      stopRinging();
                      setAnswered(true);
                    }}
                    say={griffinSays}
                    onHangUp={() => setAfterCall("fading")}
                  />
                </div>
                {answered && <ResponsePanel key={replayCount} onResponded={onResponded} />}
              </div>
              {afterCall == "busy" && <BusyPrompt onYes={() => setAfterCall("email")} />}
              {afterCall == "email" && <MadlibEmail onDone={() => router.push("/")} />}
              {!afterCall && (
                <button
                  className="secret-replay absolute right-5 top-5 rounded bg-gray-800 p-2 text-white"
                  onClick={() => {
                    startRinging();
                    setAnswered(false);
                    setResponses(0);
                    setGriffinSays(null);
                    setReplayCount((n) => n + 1);
                  }}
                >
                  Replay
                </button>
              )}
            </>
          )}
        </div>
      )}

      {phoneState != "hungUp" && (
        <img src="/arm_holding_pixellated.png" className="phone-held"></img>
      )}
    </div>
  );
};

export default Phone;
