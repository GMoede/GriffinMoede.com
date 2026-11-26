import React, { FC, ReactElement } from "react";

const PreloadAssets: FC = (): ReactElement => {
  return (
    <>
      <link
        rel="preload"
        href="/NightstandWithPhone/Nightstand.webp"
        as="image"
      />
      <link rel="preload" href="/Desk/monitor.webp" as="image" />
      <link rel="preload" href="/Desk/keyboard.webp" as="image" />
      <link rel="preload" href="/Desk/mouse.webp" as="image" />
      <link rel="preload" href="/Desk/BankerLamp.webp" as="image" />
    </>
  );
};

export default PreloadAssets;
