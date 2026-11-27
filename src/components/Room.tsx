"use client";

import React, { FC, ReactElement, useEffect, useRef } from "react";
import Link from "next/link";
import { useLights } from "../contexts/LightsContext";
import { useAudio } from "../contexts/AudioContext";
import { useRouter } from "next/navigation";
import "../app/styles/components/room.css";
const Room: FC = (): ReactElement => {
  const router = useRouter();

  const Navigate = (path: string) => {
    router.push(path);
  };

  // const [areLightsOn, setAreLightsOn] = useState(false);
  const { areLightsOn, changeLights } = useLights();
  const { toggleAudio } = useAudio();

  // Music is disabled for now; restore toggleAudio() here to bring it back.
  const MUSIC_ENABLED = false;

  const switchSound = useRef<HTMLAudioElement | null>(null);

  const turnOnLightsAndAudio = () => {
    switchSound.current ??= new Audio("/MainRoom/light-switch.mp3");
    switchSound.current.currentTime = 0;
    switchSound.current.play().catch(() => {});
    changeLights();
    if (MUSIC_ENABLED) toggleAudio();
  };

  // Keeps playing after the page switches to /contact, since it isn't tied to
  // anything on this page.
  const openPhone = () => {
    new Audio("/MainRoom/phone-stand.m4a").play().catch(() => {});
    Navigate("contact");
  };

  return (
    <div className="flex flex-row">
      <div className={areLightsOn ? "" : "overlay-dark"}></div>
      <section id="room-container">
        <div id="room">
          <div
            id="computer-desk"
            onClick={(e) => {
              Navigate("profile");
            }}
          ></div>
          <div
            id="guitar-main"
            onClick={(e) => {
              Navigate("music");
            }}
          ></div>

          <figure className="n"></figure>
          <div className="fill" id="borderimg1">
            {/* <div id="testpainting"></div> */}
          </div>
          <figure className="e"></figure>
          <figure className="w">
            <div
              className={areLightsOn ? "light-switch on" : "light-switch"}
              onClick={() => {
                turnOnLightsAndAudio();
              }}
            ></div>

            <Link href="/gallery">
              <div id="paintings">
                <div id="painting-4"></div>
                <div className="flex flex-col">
                  <div id="painting-1"></div>
                  <div id="painting-2"></div>
                </div>
                <div id="painting-3"></div>
              </div>
            </Link>
            {/* <div id="computer-desk-2"></div> */}
          </figure>
          <figure className="b"></figure>
          <figure className="t">
            <img className="ceiling-light" src="/MainRoom/CielingLamp.webp" />
          </figure>
        </div>
        {/* Same perspective as #room, but a separate 3D scene, so the walls
            and floor can't slice through the furniture placed here. */}
        <div id="room-front">
          <div
            id="phone-stand"
            onClick={openPhone}
          ></div>
        </div>
      </section>
      {/* <div className="wall flex-grow-0 flex-shrink-0"></div> */}
    </div>
  );
};

export default Room;
