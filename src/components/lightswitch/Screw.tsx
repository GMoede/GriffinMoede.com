import React, { FC, ReactElement } from "react";

interface screwProps {
  position: "top" | "bottom";
}

const Screw: FC<screwProps> = ({ position }: screwProps): ReactElement => {
  return (
    <div id="screw" className="screw flex justify-center items-center">
      <div
        id="screw-line"
        className={`${position == "top" ? "rotate-[35deg]" : "rotate=[80deg]"}`}
      ></div>
    </div>
  );
};

export default Screw;
