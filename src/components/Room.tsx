import React, { FC, ReactElement } from "react";
import LightSwitch from "./lightswitch/LightSwitch";
import DarknessOverlay from "./DarknessOverlay";
// import LightSwitchImage from "../../assets/lightswitch.png";

const Room: FC = (): ReactElement => {
  return (
    <div className="flex flex-row">
      <DarknessOverlay>
        <div></div>
      </DarknessOverlay>
      <section id="container">
        <div id="room">
          <div id="computer-desk"></div>
          <div id="phone-stand"></div>
          <div id="guitar-main"></div>

          <figure className="n"></figure>
          <figure className="e"></figure>
          <figure className="w">
            <LightSwitch />
            <div id="paintings">
              <div id="painting-4"></div>
              <div className="flex flex-col">
                <div id="painting-1"></div>
                <div id="painting-2"></div>
              </div>
              <div id="painting-3"></div>
            </div>
            {/* <div id="computer-desk-2"></div> */}
          </figure>
          <figure className="b"></figure>
          <figure className="t"></figure>
        </div>
      </section>
      {/* <div className="wall flex-grow-0 flex-shrink-0"></div> */}
    </div>
  );
};

export default Room;
