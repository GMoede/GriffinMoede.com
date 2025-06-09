"use client";
import React, { FC, ReactElement, useEffect, useState, useRef } from "react";
import BackButton from "../../components/BackButton";
import "../styles/pages/music.css";
import IpodScreen from "../../components/Ipod";

type headphoneState = "off" | "held" | "on";

const Page: FC = (): ReactElement => {
  const Hand = useRef<HTMLImageElement>(null);
  const [headphoneState, setHeadphoneState] = useState<headphoneState>("off");
  const mousePosition = useRef({ x: 0, y: 0 });

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

  const putOnHeadphones = async (e: React.MouseEvent) => {
    if (headphoneState == "held") {
      function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      Hand.current.className += " grow";
      await delay(1000);
      Hand.current.className = "hand-reaching";
      setHeadphoneState("on");
    }
  };

  const hangUpHeadphones = (e: React.MouseEvent) => {
    if (headphoneState == "held") setHeadphoneState("off");
    console.log("hang up");
  };

  const takeOffHeadphones = (e: React.MouseEvent) => {
    if (headphoneState == "on") setHeadphoneState("held");
  };

  const grow = headphoneState == "on" ? "grow" : "";

  const moveHand = (e: React.MouseEvent) => {
    const Xposition = e.clientX;
    const Yposition = e.clientY;
    mousePosition.current.x = Xposition;
    mousePosition.current.y = Yposition;

    setHandPosition(Xposition, Yposition);
  };

  const getPhoto = async () => {
    const response = await fetch("/api/s3-test", { cache: "no-store" });
    const data = await response.json();
    console.log("Fetched photos: ", data);
    console.log(data.url);
    return data;
  };
  return (
    <>
      <div className="hook" onClick={hangUpHeadphones}>
        {" "}
        hook
      </div>
      {/* {headphoneState == "on" && (
        <button
          className="take-off-headphones"
          onClick={takeOffHeadphones}
        ></button>
      )} */}
      <div
        className="music-room"
        onMouseMove={moveHand}
        onClick={putOnHeadphones}
      >
        <BackButton />
        <button
          className="border-black border-solid border-2"
          onClick={() => {
            getPhoto();
          }}
        >
          get a photo
        </button>
        <img src={handSource} alt="" ref={Hand} className={"hand-reaching"} />

        {headphoneState == "off" && (
          <img
            onClick={grabHeadphones}
            src="Music/headphones-pixellated.png"
            alt=""
            className={`headphones`}
          />
        )}
        {headphoneState == "on" && <IpodScreen />}
      </div>
    </>
  );
};

export default Page;
