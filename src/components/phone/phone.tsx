"use client";

import React, { FC, ReactElement, useRef, useState, useEffect } from "react";
import "../../app/styles/components/phone.css";
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

const Phone: FC = (): ReactElement => {
  const Hand = useRef<HTMLImageElement>(null);
  const [phoneState, setPhoneState] = useState<phoneState>("hungUp");
  const [dialingState, setDialingState] = useState<dialingState>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const Xposition = mousePosition.current.x;
    const Yposition = mousePosition.current.y;
    setHandPosition(Xposition, Yposition);
  }, [phoneState]);

  const setHandPosition = (Xposition: number, Yposition: number) => {
    const newLeft = phoneState != "hungUp" ? Xposition - 592 : Xposition - 140;
    const newTop = phoneState != "hungUp" ? Yposition + 125 : Yposition - 140;

    Hand.current.style.left = `${newLeft}px`;
    Hand.current.style.top = `${newTop}px`;
  };

  const grabPhone = (e: React.MouseEvent) => {
    if (phoneState == "hungUp") {
      setPhoneState("unhooked");
    } else {
      setPhoneState("hungUp");
    }
  };

  const moveHand = (e: React.MouseEvent) => {
    const Xposition = e.clientX;
    const Yposition = e.clientY;
    mousePosition.current.x = Xposition;
    mousePosition.current.y = Yposition;

    setHandPosition(Xposition, Yposition);
  };

  const pressKeyDown = (e: React.MouseEvent) => {
    const keyElement = e.currentTarget as HTMLDivElement;
    const key = keyElement.dataset.key;
    const sound = new Audio(`Phone/audio/key${key}.mp3`);
    sound.play();
    setPhoneState("pressing");
    setDialingState(key as dialingState);
  };

  const keyUp = (e: React.MouseEvent) => {
    setPhoneState("unhooked");
    setDialingState(null);
  };

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
    <div className="phone-and-stand" onMouseMove={moveHand}>
      <div className="contact-header">
        <h1>Like what you see? Give me a ring! (email)</h1>
        <h1>griffinmoede@gmail.com</h1>
      </div>
      <img src={handSource} alt="" ref={Hand} className={handClass} />
      <div className="phone-keys-container">{buttons}</div>

      <div className="phone-container">
        <img className="phone" src={phoneSource} alt="" />
        <div className="phone-click-box" onClick={grabPhone}></div>
      </div>
      <img
        className="nightstand"
        src="NightstandWithPhone/Nightstand.png"
        alt=""
      />

      {phoneState != "hungUp" && (
        <img src="/arm_holding_pixellated.png" className="phone-held"></img>
      )}
    </div>
  );
};

export default Phone;
