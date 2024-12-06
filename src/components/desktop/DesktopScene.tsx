import exp from "constants";
import React, { FC, ReactElement } from "react";
import ComputerDesktop from "./ComputerDesktop";

const DesktopScene: FC = (): ReactElement => {
  return (
    <div className="desktop-container">
      <div className="monitor-container ">
        <div className="monitor">
          <ComputerDesktop />
        </div>
        {/* <div className="monitor">Go to the right!</div> */}
      </div>

      <div className="desk">
        <div className="keyboard-and-mouse">
          <img className="keyboard" src="Desk/keyboard.png" alt="" />
          <img className="mouse" src="Desk/mouse.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export default DesktopScene;
