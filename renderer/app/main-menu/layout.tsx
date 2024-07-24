"use client";

import PageTransition from "@/lib/ui/components/page-transition";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PageTransition>
        {children}
      </PageTransition>
    </>
  )
};
