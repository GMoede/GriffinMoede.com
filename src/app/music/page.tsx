"use client";
import React, { FC, ReactElement, useEffect } from "react";
import BackButton from "../../components/BackButton";

const Page: FC = (): ReactElement => {
  // useEffect(() => {
  //   getTracks();
  // }, []);

  // const getTracks = async () => {
  //   const tracks = await fetch("https://soundcloud.com/yunggreed503");
  //   console.log("tracks", tracks);
  // };
  return (
    <div className="flex flex-row music-room">
      <BackButton />
      <img src={"/guitar.png"} alt="" className="guitar-closeup" />
      {/* <img src={soundcloudIcon.src} className="soundcloud-icon" alt="" /> */}
      <div className="soundcloud-widget-container">
        <iframe
          allow="autoplay"
          className="soundcloud-widget"
          src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1872106589&color=%233a4ce5&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true&show_artwork=false`}
        ></iframe>
      </div>
    </div>
  );
};

export default Page;
