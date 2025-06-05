"use client";

import {
  createContext,
  useContext,
  useState,
  FC,
  ReactElement,
  ReactNode,
} from "react";

interface LightsProviderProps {
  children: ReactNode;
}

interface LightsContext {
  areLightsOn: boolean;
  changeLights: () => void;
}

const LightsContext = createContext<LightsContext | null>(null);

const LightsProvider: FC<LightsProviderProps> = ({
  children,
}): ReactElement => {
  const [areLightsOn, setAreLightsOn] = useState<boolean>(false);

  const changeLights = (): void => {
    console.log("areLightsOn", areLightsOn);
    setAreLightsOn(!areLightsOn);
  };

  return (
    <LightsContext.Provider value={{ areLightsOn: areLightsOn, changeLights }}>
      {children}
    </LightsContext.Provider>
  );
};

export default LightsProvider;

export const useLights = (): LightsContext => {
  const context = useContext(LightsContext);

  if (!context) {
    throw new Error("useLights must be used within a LightsProvider");
  }

  return context;
};
