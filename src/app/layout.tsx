import React, { FC, ReactElement, ReactNode } from "react";
import "./styles/globals.css";
import "tailwindcss/tailwind.css";
import LightsProvider from "../contexts/LightsContext";
import AudioProvider from "../contexts/AudioContext";
import PreloadAssets from "./preload";

const Root: FC = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <html lang="en">
      <head>
        <PreloadAssets />
      </head>
      <body>
        <main>
          <AudioProvider>
            <LightsProvider>{children}</LightsProvider>
          </AudioProvider>
        </main>
      </body>
    </html>
  );
};

export default Root;
