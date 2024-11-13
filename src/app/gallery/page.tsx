"use client";

import React, { FC, ReactElement, useState } from "react";

const GalleryPage: FC = (): ReactElement => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [centerPosition, setCenterPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const moveMouse = (e: React.MouseEvent): void => {
    console.log("mouse position", mousePosition.x, mousePosition.y);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={moveMouse} className="gallery-background">
      <div
        style={{
          top: `${centerPosition.y - mousePosition.y}px`,
          left: `${centerPosition.x - mousePosition.x}px`,
        }}
        className="paintings-container"
      >
        <div className="test-div"></div>
      </div>
    </div>
  );
};

export default GalleryPage;
