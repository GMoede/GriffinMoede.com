import exp from "constants";
import React, { FC, ReactElement } from "react";
import ComputerDesktop from "./ComputerDesktop";
import "../../app/styles/components/desktop.css";

const DesktopScene: FC = (): ReactElement => {
  return (
    <div className="desktop-container">
      <img className="desk-lamp" src="Desk/BankerLamp.png" alt="" />

      <div className="monitor-container ">
        <div className="monitor">
          <ComputerDesktop />
        </div>
      </div>

      <div className="keyboard-and-mouse">
        <img className="keyboard" src="Desk/keyboard.png" alt="" />
        <img className="mouse" src="Desk/mouse.png" alt="" />
      </div>

      <div className="desk"></div>
    </div>
  );
};

export default DesktopScene;
