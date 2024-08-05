"use client";

import PageTransition from "@lib/ui/components/PageTransition";
import QuickMenu from "@lib/ui/components/player/QuickMenu";
import Isolated from "@/lib/ui/elements/isolated";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Isolated className="relative">
        <div className="absolute inset-0 w-full h-full flex items-left justify-start bg-gray-200 bg-opacity-75">
          <QuickMenu />
          {children}
        </div>
      </Isolated>
    </>
  )
};
