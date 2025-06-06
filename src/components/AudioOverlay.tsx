"use client";
import React, { FC, ReactElement, ReactNode } from "react";

const AudioOverlay: FC<{ children: ReactNode }> = ({
  children,
}): ReactElement => {
  return (
    <div className="audio-overlay">
      <audio
        src="theme_music.mp3"
        autoPlay
        loop
        style={{ display: "none" }}
      ></audio>
      {children}
    </div>
  );
};

export default AudioOverlay;
