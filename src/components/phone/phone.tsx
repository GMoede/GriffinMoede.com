"use client";

import React, { FC, ReactElement, useRef, useState, useEffect } from "react";

const Phone: FC = (): ReactElement => {
  const Hand = useRef<HTMLImageElement>(null);
  const [holding, setHolding] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  const setHandPosition = (Xposition: number, Yposition: number) => {
    const newLeft = holding ? Xposition - 600 : Xposition - 140;
    const newTop = holding ? Yposition + 130 : Yposition - 140;

    Hand.current.style.left = `${newLeft}px`;
    Hand.current.style.top = `${newTop}px`;
    console.log("moved");
  };

  useEffect(() => {
    const Xposition = mousePosition.current.x;
    const Yposition = mousePosition.current.y;
    setHandPosition(Xposition, Yposition);
  }, [holding]);

  const handSource = holding
    ? "/arm_pointing_pixellated.png"
    : "/arm_reaching_pixellated.png";

  const handClass = holding ? "hand-pointing" : "hand-reaching";

  const phoneSource = holding
    ? "/phone_unhooked_pixellated.png"
    : "/pixel_phone.png";

  const grabPhone = async (e: React.MouseEvent) => {
    setHolding(!holding);
  };

  const moveHand = (e: React.MouseEvent) => {
    const Xposition = e.clientX;
    const Yposition = e.clientY;
    mousePosition.current.x = Xposition;
    mousePosition.current.y = Yposition;

    setHandPosition(Xposition, Yposition);
  };

  return (
    <div className="phone-container" onMouseMove={moveHand}>
      <div className="contact-header">
        <h1>Like what you see? Give me a ring! (email)</h1>
        <h1>griffinmoede@gmail.com</h1>
      </div>
      <img src={handSource} alt="" ref={Hand} className={handClass} />

      <img className="phone" src={phoneSource} alt="" />
      <div className="phone-click-box" onClick={grabPhone}></div>
      <img
        className="nightstand"
        src="NightstandWithPhone/Nightstand.png"
        alt=""
      />

      {holding && (
        <img src="/arm_holding_pixellated.png" className="phone-held"></img>
      )}
    </div>
  );
};

export default Phone;
