"use client";

import React, { FC, ReactElement, useRef } from "react";

const Phone: FC = (): ReactElement => {
  const Hand = useRef<HTMLImageElement>(null);

  const moveHand = (e: React.MouseEvent) => {
    const Xposition = e.clientX;
    const Yposition = e.clientY;

    Hand.current.style.left = `${Xposition - 90}px`;
    Hand.current.style.top = `${Yposition - 140}px`;
  };

  return (
    <div className="phone-container" onMouseMove={moveHand}>
      <img
        src="/NightstandWithPhone/arm_holding_long.png"
        alt=""
        ref={Hand}
        className="hand"
      />
      <img className="phone" src="/pixel_phone.png" alt="" />
    </div>
  );
};

export default Phone;
