"use client";
import React, { FC, ReactElement, useEffect, useState, useRef } from "react";
import BackButton from "../../components/BackButton";
import { BucketType } from "@aws-sdk/client-s3";

type headphoneState = "off" | "held" | "on";

const Page: FC = (): ReactElement => {
  const Hand = useRef<HTMLImageElement>(null);
  const [headphoneState, setHeadphoneState] = useState<headphoneState>("off");
  const mousePosition = useRef({ x: 0, y: 0 });
  const [ipodWheelPosition, setIpodWheePosition] = useState<number>(1);
  const [currentIpodScroll, setCurrentIpodScroll] = useState<number>(0);

  const setHandPosition = (Xposition: number, Yposition: number) => {
    const newLeft = headphoneState == "off" ? Xposition - 140 : Xposition - 670;
    const newTop = headphoneState == "off" ? Yposition - 140 : Yposition - 140;

    Hand.current.style.left = `${newLeft}px`;
    Hand.current.style.top = `${newTop}px`;
  };

  useEffect(() => {
    const Xposition = mousePosition.current.x;
    const Yposition = mousePosition.current.y;
    setHandPosition(Xposition, Yposition);
  }, []);

  let handSource;
  if (headphoneState == "off") {
    handSource = "arm_reaching_pixellated.png";
  } else if (headphoneState == "held") {
    handSource = "Music/handsholdingheadphones-pixellated.png";
  } else if (headphoneState == "on") {
    handSource = "";
  }

  const grabHeadphones = (e: React.MouseEvent) => {
    console.log("grab headphones");
    setHeadphoneState("held");
  };

  const putOnHeadphones = (e: React.MouseEvent) => {
    if (headphoneState == "held") setHeadphoneState("on");
  };

  const hangUpHeadphones = (e: React.MouseEvent) => {
    if (headphoneState == "held") setHeadphoneState("off");
    console.log("hang up");
  };

  const takeOffHeadphones = (e: React.MouseEvent) => {
    if (headphoneState == "on") setHeadphoneState("held");
  };

  const spinWheel = (e: any) => {
    const target = e.target as HTMLElement;
    console.log("currentSCroll", currentIpodScroll);

    // The lower the number, the faster it spins
    const spinSpeed = 5;

    if (target.scrollTop > currentIpodScroll + spinSpeed) {
      if (ipodWheelPosition == 7) {
        setIpodWheePosition(1);
      } else {
        setIpodWheePosition(ipodWheelPosition + 1);
      }
      setCurrentIpodScroll(target.scrollTop);
    } else if (target.scrollTop < currentIpodScroll - spinSpeed) {
      if (ipodWheelPosition == 1) {
        setIpodWheePosition(7);
      } else {
        setIpodWheePosition(ipodWheelPosition - 1);
      }
      setCurrentIpodScroll(target.scrollTop);
    }
  };

  const moveHand = (e: React.MouseEvent) => {
    const Xposition = e.clientX;
    const Yposition = e.clientY;
    mousePosition.current.x = Xposition;
    mousePosition.current.y = Yposition;

    setHandPosition(Xposition, Yposition);
  };
  return (
    <>
      <div className="hook" onClick={hangUpHeadphones}>
        {" "}
        hook
      </div>
      {headphoneState == "on" && (
        <button
          className="take-off-headphones"
          onClick={takeOffHeadphones}
        ></button>
      )}
      <div
        className="music-room"
        onMouseMove={moveHand}
        onClick={putOnHeadphones}
      >
        <BackButton />
        <img src={handSource} alt="" ref={Hand} className={"hand-reaching"} />

        {headphoneState == "off" && (
          <img
            onClick={grabHeadphones}
            src="Music/headphones-pixellated.png"
            alt=""
            className="headphones"
          />
        )}
        {headphoneState == "on" && (
          <div className="ipod">
            <img
              src={`Music/ipod_images/ipod_${ipodWheelPosition}.png`}
              className="ipod-case"
            />
            <div className="ipod-case"></div>
            <div className="ipod-screen" onScroll={spinWheel}>
              <img src="galleryImages/galleryimage1.jpg" alt="" />
              <img src="galleryImages/galleryimage2.jpg" alt="" />
              <img src="galleryImages/galleryimage3.jpg" alt="" />
              <img src="galleryImages/galleryimage4.jpg" alt="" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
