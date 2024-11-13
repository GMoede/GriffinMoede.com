"use client";

import React, { FC, ReactElement, use, useEffect, useState } from "react";

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
    const aimX = paintingsContainerWidth * proportionalMousePosition.x;
    const aimY = paintingsContainerHeight * proportionalMousePosition.y;

    // set the current scroll position
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
        <div>hello</div>
        <div className="test-div"></div>
      </div>
    </div>
  );
};

export default GalleryPage;
