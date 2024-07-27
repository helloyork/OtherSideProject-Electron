"use client";

import PageTransition from "@/lib/ui/components/page-transition";
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
      <Isolated>
        <div className="fixed inset-0 w-full h-full flex items-left justify-start bg-gray-100 bg-opacity-75">
          {children}
        </div>
      </Isolated>
    </>
  )
};
