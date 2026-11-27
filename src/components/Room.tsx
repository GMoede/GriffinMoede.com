"use client";

import React, { FC, ReactElement, useEffect, useRef } from "react";
import Link from "next/link";
import { useLights } from "../contexts/LightsContext";
import { useAudio } from "../contexts/AudioContext";
import { useRouter } from "next/navigation";
import "../app/styles/components/room.css";

// Everything the phone page (/contact) shows on its first frame.
const PHONE_PAGE_IMAGES = [
  "/NightstandWithPhone/Nightstand.webp",
  "/Phone/phone_hungUp.png",
  "/arm_reaching_pixellated.png",
];

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

  // Resolves once the phone page's images are downloaded and decoded.
  const phoneAssetsReady = useRef<Promise<unknown> | null>(null);
  // Holds the decoded images so the browser keeps them in memory.
  const phoneImages = useRef<HTMLImageElement[]>([]);

  // Warm up the phone page while the visitor is still in the room, so opening
  // it doesn't flash an empty screen while the nightstand photo decodes.
  useEffect(() => {
    router.prefetch("/contact");
    phoneImages.current = PHONE_PAGE_IMAGES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    phoneAssetsReady.current = Promise.all(
      phoneImages.current.map((img) => img.decode().catch(() => {}))
    );
  }, [router]);

  // Keeps playing after the page switches to /contact, since it isn't tied to
  // anything on this page.
  const openPhone = async () => {
    new Audio("/MainRoom/phone-stand.m4a").play().catch(() => {});
    // If the images are still loading (a very fast click), wait for them, but
    // never hold the click up for more than a moment.
    await Promise.race([
      phoneAssetsReady.current,
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
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
