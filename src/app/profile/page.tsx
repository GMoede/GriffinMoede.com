import React, { FC, ReactElement } from "react";
import DesktopScene from "../../components/desktop/DesktopScene";

const DesktopPage: FC = (): ReactElement => {
  return (
    <div className="profile-background">
      <DesktopScene />
    </div>
  );
};

export default DesktopPage;
