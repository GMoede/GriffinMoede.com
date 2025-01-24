"use client";

import React, { FC, ReactElement } from "react";
import { useRouter } from "next/navigation";

const BackButton: FC = (): ReactElement => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-5 left-5 z-10 rounded bg-gray-800 p-2 text-white"
    >
      Back
    </button>
  );
};

export default BackButton;
