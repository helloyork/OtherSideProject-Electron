"use client";

import { Constants } from "@/lib/api/config";
import QuickMenu from "@/lib/ui/components/player/quick-menu";
import { useGame } from "@/lib/ui/providers/game-state";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function Page() {
  const { game } = useGame();
  console.log(game)
  return (
    <div className="relative">
      <h2 className="text-white">Player</h2>
    </div>
  );
};