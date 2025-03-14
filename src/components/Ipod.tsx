"use client";
import React, { FC, ReactElement, useState, useEffect, useRef } from "react";
import "../app/styles/pages/music.css";

interface songListBoundaries {
  top: number;
  bottom: number;
}

const IpodScreen: FC = (): ReactElement => {
  const [songList, setSongList] = useState<string[]>([]);
  const [ipodWheelPosition, setIpodWheePosition] = useState<number>(1);
  const [currentIpodScroll, setCurrentIpodScroll] = useState<number>(0);
  const [selectedSong, setSelectedSong] = useState<number>(0);
  const [songListBoundaries, setSongListBoundaries] =
    useState<songListBoundaries>({ top: 0, bottom: 5 });
  const songListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const songs = [
      "song1",
      "song2",
      "song3",
      "song4",
      "song5",
      "song6",
      "song7",
      "song8",
      "song9",
      "song10",
      "song11",
    ];
    setSongList(songs);
  }, []);

  const songs = songList.map((song, index) => {
    return (
      <div
        className={`song-box ${selectedSong == index ? "selected" : ""}`}
        key={index}
      >
        {song}
      </div>
    );
  });

  const fakeSongs = [];
  for (let i = 0; i < 6; i++) {
    fakeSongs.push(<div className="fake-song">{i}</div>);
  }
  songList.forEach((song) => {
    fakeSongs.push(<div className="fake-song">{song}</div>);
  });

  const spinWheel = (e: any) => {
    const target = e.target as HTMLElement;
    console.log("currentSCroll", currentIpodScroll);

    // The lower the number, the faster it spins
    const spinSpeed = 28;

    //
    // SCROLLING DOWN
    // check if the current scroll position has moved down far enough
    if (target.scrollTop > currentIpodScroll + spinSpeed) {
      // check if the wheel position is at the end
      if (ipodWheelPosition == 7) {
        setIpodWheePosition(1);
      } else {
        setIpodWheePosition(ipodWheelPosition + 1);
      }

      // check if the selected song is at the end of the song list
      if (selectedSong < songs.length) setSelectedSong(selectedSong + 1);
      setCurrentIpodScroll(target.scrollTop);

      //check if current song is at bottom of screen
      if (selectedSong == songListBoundaries.bottom) {
        songListRef.current.scrollTop += spinSpeed;
        setSongListBoundaries({
          top: songListBoundaries.top + 1,
          bottom: songListBoundaries.bottom + 1,
        });
      }

      //
      // SCROLLING UP
      // check if the current scroll position has moved up far enough
    } else if (target.scrollTop < currentIpodScroll - spinSpeed) {
      // check if the wheel position is at the beginning
      if (ipodWheelPosition == 1) {
        setIpodWheePosition(7);
      } else {
        setIpodWheePosition(ipodWheelPosition - 1);
      }

      // check if the selected song is at the beginning of the song list
      if (selectedSong > 0) setSelectedSong(selectedSong - 1);
      setCurrentIpodScroll(target.scrollTop);

      //check if current song is at top of screen
      if (selectedSong == songListBoundaries.top) {
        songListRef.current.scrollTop -= spinSpeed;
        setSongListBoundaries({
          top: songListBoundaries.top - 1,
          bottom: songListBoundaries.bottom - 1,
        });
      }
    }
  };

  return (
    <div className="ipod">
      <img
        src={`Music/ipod_images/ipod_${ipodWheelPosition}.png`}
        className="ipod-case"
      />
      <div className="ipod-screen">
        <div className="ipod-header">
          <span>iPod</span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Font_Awesome_5_solid_battery-half.svg"
            alt=""
            className="ipod-battery"
          />
        </div>
        <div className="song-list" ref={songListRef}>
          {songs}
        </div>
      </div>
      <div className="ipod-screen-2" onScroll={spinWheel}>
        {fakeSongs}
      </div>
    </div>
  );
};

export default IpodScreen;
