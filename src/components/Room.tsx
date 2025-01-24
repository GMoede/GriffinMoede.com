"use client";

import React, { FC, ReactElement, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import LightSwitchImage from "../../assets/lightswitch.png";

const Room: FC = (): ReactElement => {
  const router = useRouter();

  const Navigate = (path: string) => {
    router.push(path);
  };

  const [areLightsOn, setAreLightsOn] = useState(false);

  return (
    <div className="flex flex-row">
      <div className={areLightsOn ? "" : "overlay-dark"}></div>
      <section id="container">
        <div id="room">
          <div
            id="computer-desk"
            onClick={(e) => {
              Navigate("profile");
            }}
          ></div>
          <div
            id="phone-stand"
            onClick={(e) => {
              Navigate("contact");
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
                setAreLightsOn(!areLightsOn);
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
            <img className="ceiling-light" src="/MainRoom/CielingLamp.png" />
          </figure>
        </div>
      </section>
      {/* <div className="wall flex-grow-0 flex-shrink-0"></div> */}
    </div>
  );
};

export default Room;
