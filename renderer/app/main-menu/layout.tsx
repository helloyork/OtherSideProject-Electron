"use client";

import PageTransition from "@/lib/ui/components/page-transition";
import clsx from "clsx";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PageTransition className={clsx("h-full")}>
        {children}
      </PageTransition>
    </>
  )
};
