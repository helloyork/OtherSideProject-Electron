"use client";

import { Constants } from "@/lib/api/config";
import QuickMenu from "@/lib/ui/components/player/quick-menu";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="relative">
      <QuickMenu />
      <h2 className="text-white">Player</h2>
    </div>
  );
};