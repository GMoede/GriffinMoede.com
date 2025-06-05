"use client";
import React, { FC, ReactElement, ReactNode } from "react";
import { useLights } from "../contexts/LightsContext";

interface Props {
  children: ReactNode;
}

const DarknessOverlay: FC<Props> = ({ children }): ReactElement => {
  const { areLightsOn } = useLights();
  console.log("lights ?:  ", areLightsOn);
  return (
    <>
      {!areLightsOn && (
        <>
          <div id="overlay-dark"></div>
        </>
      )}
      {children}
    </>
  );
};

export default DarknessOverlay;
