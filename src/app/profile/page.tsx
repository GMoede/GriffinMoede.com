import React, { FC, ReactElement } from "react";
import DesktopScene from "../../components/desktop/DesktopScene";
import BackButton from "../../components/BackButton";

const DesktopPage: FC = (): ReactElement => {
  return (
    <div className="profile-background">
      <BackButton />
      <DesktopScene />
    </div>
  );
};

export default DesktopPage;
