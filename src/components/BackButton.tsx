"use client";

import React, { FC, ReactElement } from "react";
import { useRouter } from "next/navigation";

const BackButton: FC = (): ReactElement => {
  const router = useRouter();

  // Go back to the previous page on this site. If the visitor opened this
  // page directly (a link, a bookmark, a refresh), there's nothing here to go
  // back to, so take them to the room instead.
  const goBack = () => {
    // The browser's own page load. Moving between pages inside the site
    // doesn't change it, so if it's this page, the visitor started here.
    const load = performance.getEntriesByType("navigation")[0];
    const startedHere = !load || new URL(load.name).pathname == location.pathname;
    if (startedHere) router.push("/");
    else router.back();
  };

  return (
    <button
      onClick={goBack}
      className="absolute top-5 left-5 z-10 rounded bg-gray-800 p-2 text-white"
    >
      Back
    </button>
  );
};

export default BackButton;
