"use client";

import PageTransition from "@/lib/ui/components/page-transition";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AnimatePresence>
        <PageTransition className={clsx("h-full")}>
          <div className={clsx("flex bg-cover bg-center h-full")}>
            <motion.div
              className={clsx("w-full")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {children}
            </motion.div>
          </div>
        </PageTransition>
      </AnimatePresence>
    </>
  )
};
