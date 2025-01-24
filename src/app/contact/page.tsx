import React, { FC, ReactElement } from "react";
import Phone from "../../components/phone/phone";
import BackButton from "../../components/BackButton";

const Page: FC = (): ReactElement => {
  return (
    <div>
      <div>
        <h1>Like what you see? Give me a ring! (email)</h1>
      </div>
      <div>
        <h2>email: griffinmoede@gmail.com</h2>
      </div>
      <BackButton />
      <div>
        <Phone />
      </div>
    </div>
  );
};

export default Page;
