"use client";

import {
  createContext,
  useContext,
  useState,
  FC,
  ReactElement,
  ReactNode,
  useRef,
  useEffect,
} from "react";

interface AudioProviderProps {
  children: ReactNode;
}

interface AudioContext {
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContext | null>(null);

const AudioProvider: FC<AudioProviderProps> = ({ children }): ReactElement => {
  const [audioOn, setAudioOn] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (audioOn) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioOn]);

  const toggleAudio = (): void => {
    setAudioOn(!audioOn);
  };

  return (
    <AudioContext.Provider value={{ toggleAudio }}>
      <audio
        src="theme_music.mp3"
        loop
        style={{ display: "none" }}
        onPlay={() => console.log("Audio started playing")}
        onPause={() => console.log("Audio paused")}
        ref={audioRef}
      ></audio>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioProvider;

export const useAudio = (): AudioContext => {
  const context = useContext(AudioContext);

  if (!context) {
    throw new Error("useLights must be used within a LightsProvider");
  }

  return context;
};
