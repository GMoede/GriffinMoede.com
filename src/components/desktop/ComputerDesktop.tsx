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
    const icon = e.currentTarget as HTMLImageElement;
    const containerRect = desktopRef.current.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();

    // set the initial position of the icon
    icon.style.left = window.getComputedStyle(icon).left;
    icon.style.top = window.getComputedStyle(icon).top;

    const dragIcon = (e: any): void => {
      e.preventDefault();

      const currentLeft = parseInt(
        window.getComputedStyle(icon).left.slice(0, -2)
      );
      const currentTop = parseInt(
        window.getComputedStyle(icon).top.slice(0, -2)
      );

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
    router.push(`/profile/documents/${e.currentTarget.id}`);
  };

  return (
    <div className="computer-desktop" ref={desktopRef}>
      <DesktopHeader currentTime={currentTime} closeup={false} />
      <div className="icons">
        <div
          className="icon-container"
          onMouseDown={dragIconStart}
          onDoubleClick={openDocument}
          id="resume"
          // style={{ top: "0px", left: "100px" }}
        >
          <img
            className="icon"
            src="/Icon_pdf_file.svg.png"
            alt=""
            draggable="false"
          />
          <div className="icon-label">My Resume</div>
        </div>
      </div>
    </div>
  );
};

export default ComputerDesktop;
