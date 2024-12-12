"use client";

import React, { FC, ReactElement, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DesktopHeader from "./DesktopHeader";

const ComputerDesktop: FC = (): ReactElement => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const router = useRouter();
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
    if (!desktopRef.current) return;
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
      if (!desktopRef.current) return;
      desktopRef.current.removeEventListener("mousemove", dragIcon);
      desktopRef.current.removeEventListener("mouseup", dropIcon);
    };

    desktopRef.current.addEventListener("mouseup", dropIcon);
  };

  // TO DO: give a type to e that includes id
  const openDocument = (e: any): void => {
    console.log(e.target.id);
    router.push(`/profile/documents/${e.target.id}`);
  };

  return (
    <div className="computer-desktop" ref={desktopRef}>
      <DesktopHeader currentTime={currentTime} closeup={false} />
      <div className="icons">
        <img
          className="image1"
          src="/galleryImages/galleryimage1.jpg"
          alt=""
          draggable="false"
          height="40"
          id="resume"
          onMouseDown={dragIconStart}
          onDoubleClick={openDocument}
        />
      </div>
    </div>
  );
};

export default ComputerDesktop;
