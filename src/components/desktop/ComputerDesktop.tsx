"use client";

import React, { FC, ReactElement, useRef, useState, useEffect } from "react";

const ComputerDesktop: FC = (): ReactElement => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newDate = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
      setCurrentTime(newDate);
    }, 1000); // Update every second

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const dragIconStart = (e: React.MouseEvent): void => {
    const icon = e.target as HTMLImageElement;
    const containerRect = desktopRef.current.getBoundingClientRect();
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
        currentTop >= containerRect.height - iconRect.height - 15 &&
        e.movementY > 0
      ) {
        console.log("cant move down");
      }
      // move up/down
      else {
        icon.style.top = currentTop + e.movementY + "px";
      }
    };

    desktopRef.current.addEventListener("mousemove", dragIcon);

    const dropIcon = (e: any): void => {
      desktopRef.current.removeEventListener("mousemove", dragIcon);
      desktopRef.current.removeEventListener("mouseup", dropIcon);
    };

    desktopRef.current.addEventListener("mouseup", dropIcon);
  };

  // const dragIconDrop = (e: React.MouseEvent): void => {};

  return (
    <div className="computer-desktop" ref={desktopRef}>
      <header className="computer-header">
        <div className="computer-header-left">
          <div className="apple-logo"></div>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Special</span>
          <span>Help</span>
        </div>
        <div className="computer-header-right">
          <span>{currentTime}</span>
          <div className="finder-logo"></div>
          <span>Finder</span>
        </div>
      </header>
      <div className="icons">
        <img
          className="image1"
          src="/galleryImages/galleryimage1.jpg"
          alt=""
          draggable="false"
          height="40"
          onMouseDown={dragIconStart}
        />
      </div>
    </div>
  );
};

export default ComputerDesktop;
