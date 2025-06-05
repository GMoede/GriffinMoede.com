import React, { FC, ReactElement } from "react";

const PreloadAssets: FC = (): ReactElement => {
  return (
    <>
      <link
        rel="preload"
        href="NightstandWithPhone/Nightstand.png"
        as="image"
      />
      <link rel="preload" href="Desk/monitor.png" as="image" />
      <link rel="preload" href="Desk/keyboard.png" as="image" />
      <link rel="preload" href="Desk/mouse.png" as="image" />
      <link rel="preload" href="Desk/Bankerlamp.png" as="image" />
    </>
  );
};

export default PreloadAssets;
