import exp from "constants";
import React, { FC, ReactElement } from "react";
import ComputerDesktop from "./ComputerDesktop";

const DesktopScene: FC = (): ReactElement => {
  return (
    <div className="desktop-container">
      <div className="desk">
        <div className="monitor-container flex flex-col">
          <div className="monitor">
            {/* <img src="Desk/monitor.png" alt="" /> */}
            <ComputerDesktop />
          </div>
        </div>
        <div className="keyboard-and-mouse flex flex-row">
          <img className="keyboard" src="Desk/keyboard.png" alt="" />
          <img className="mouse" src="Desk/mouse.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export default DesktopScene;
