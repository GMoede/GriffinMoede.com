"use client";

import React, { FC, ReactElement, useRef, useEffect, useState } from "react";
import GalleryWall from "../../components/gallerywall/GalleryWall";

const GalleryPage: FC = (): ReactElement => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [currentScroll, setCurrentScroll] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const moveMouse = (e: React.MouseEvent): void => {
    const paintingsContainer = document.querySelector(".paintings-container");

    const containerRect = paintingsContainer.getBoundingClientRect();

    // size of our paintings container
    const paintingsContainerWidth = paintingsContainer.clientWidth;
    const paintingsContainerHeight = paintingsContainer.clientHeight;

    //center points of the screen
    const centerWidth = window.innerWidth / 2;
    const centerHeight = window.innerHeight / 2;

    //mouse position
    const mousePositionX = e.clientX;
    const mousePositionY = e.clientY;

    //proportional distance mouse is from center
    const proportionalMousePosition = {
      x: (e.pageX - centerWidth) / window.innerWidth,
      y: (e.pageY - centerHeight) / window.innerHeight,
    };

    // length of paintings container to scroll proportional to mouse's
    // distance from center
    let aimX = paintingsContainerWidth * proportionalMousePosition.x;
    let aimY = paintingsContainerHeight * proportionalMousePosition.y;

    // if the aim is outside the container, don't scroll
    if (aimX < (containerRect.width / 2 - window.innerWidth / 2) * -1) {
      aimX = currentScroll.x;
    }

    if (aimY < (containerRect.height / 2 - window.innerHeight / 2) * -1) {
      aimY = currentScroll.y;
    }

    if (aimX > containerRect.width / 2 - window.innerWidth / 2) {
      aimX = currentScroll.x;
    }

    if (aimY > containerRect.height / 2 - window.innerHeight / 2) {
      aimY = currentScroll.y;
    }

    setCurrentScroll({
      x: aimX,
      y: aimY,
    });
  };

  return (
    <div onMouseMove={moveMouse} className="gallery-background">
      <div
        style={{
          top: `${currentScroll.y * -1}px`,
          left: `${currentScroll.x * -1}px`,
        }}
        className="paintings-container"
      >
        <GalleryWall />
      </div>
    </div>
  );
};

export default GalleryPage;
