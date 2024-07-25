"use client";

import { Constants } from "@/lib/api/config";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center p-4">
        <img src={Constants.src.images.LOGO} className="w-1/4 h-auto" alt="Logo" />
        {/* <p className="text-white font-thin text-2xl">{Constants.info.app.name}</p> */}
      </div>
    </div>
  );
};