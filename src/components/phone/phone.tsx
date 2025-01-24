"use client";

import React, { FC, ReactElement, useRef, useState, useEffect } from "react";

const Phone: FC = (): ReactElement => {
  const Hand = useRef<HTMLImageElement>(null);
  const [holding, setHolding] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  const setHandPosition = (Xposition: number, Yposition: number) => {
    const newLeft = holding ? Xposition - 670 : Xposition - 140;
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
    // fetch the image from the server,
    // this comes in the form of a base64 string
    // const response = await fetch("/api/photos");
    // const data = await response.json();
    // const url = data.url;
    // console.log("url", url);

    // convert the base64 string to an image
    // const imgURL = url;
    // setImgTest(imgURL);
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
      <img src={handSource} alt="" ref={Hand} className={handClass} />

      <img className="phone" src={phoneSource} alt="" />
      <div className="phone-click-box" onClick={grabPhone}></div>
      {holding && (
        <img src="/arm_holding_pixellated.png" className="phone-held"></img>
      )}
    </div>
  );
};

export default Phone;
