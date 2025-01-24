import React, { FC, ReactElement } from "react";
import Phone from "../../components/phone/phone";
import BackButton from "../../components/BackButton";

const Page: FC = (): ReactElement => {
  return (
    <div className="profile-background">
      <BackButton />
      <div>
        <Phone />
      </div>
    </div>
  );
};

export default Page;
