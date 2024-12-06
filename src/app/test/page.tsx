"use client";

import React, { FC, ReactElement, useRef } from "react";

const DnDTest: FC = (): ReactElement => {
  const iconsContainer = useRef<HTMLDivElement>(null);
  const iconOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const dragIconStart = (e: React.MouseEvent): void => {
    const icon = e.target as HTMLImageElement;
    const containerRect = iconsContainer.current.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const dragIcon = (e: any): void => {
      e.preventDefault();

      const currentLeft = parseInt(icon.style.left.slice(0, -2));
      const currentTop = parseInt(icon.style.top.slice(0, -2));

      !currentLeft ? (icon.style.left = 0 + "px") : null;
      !currentTop ? (icon.style.top = 0 + "px") : null;

      // X direction movement

      // prevent moving outside to the left
      if (currentLeft <= 0 && e.movementX < 0) {
        console.log("cant move left");
      }
      // prevent moving outside to the right
      else if (
        currentLeft >= containerRect.width - iconRect.width &&
        e.movementX > 0
      ) {
        console.log("cant move right");
      }
      // move left/right
      else {
        icon.style.left = currentLeft + e.movementX + "px";
      }

      // prevent moving outside to the top
      if (currentTop <= 0 && e.movementY < 0) {
        console.log("cant move up");
      }
      // prevent moving outside to the bottom
      else if (
        currentTop >= containerRect.height - iconRect.height &&
        e.movementY > 0
      ) {
        console.log("cant move down");
      }
      // move up/down
      else {
        icon.style.top = currentTop + e.movementY + "px";
      }
    };

    iconsContainer.current.addEventListener("mousemove", dragIcon);

    const dropIcon = (e: any): void => {
      iconsContainer.current.removeEventListener("mousemove", dragIcon);
      iconsContainer.current.removeEventListener("mouseup", dropIcon);
    };

    iconsContainer.current.addEventListener("mouseup", dropIcon);
  };

  return (
    <div className="container">
      <div className="icons" ref={iconsContainer}>
        <div className="icon1" onMouseDown={dragIconStart}></div>
      </div>
    </div>
  );
};
export default DnDTest;
