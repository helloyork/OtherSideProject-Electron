import React from 'react';
import clsx from "clsx";
import { Inter } from "next/font/google";

import type { Metadata } from 'next/types';

import '@lib/styles/globals.css'
import Provider from '@lib/ui/provider';
import Main from '@lib/ui/elements/main';
import FrameBar from '@/lib/ui/components/framebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OtherSideProject",
  description: "OtherSideProject",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx("h-full")}>
      <body className={clsx("h-full flex flex-col flex-grow", inter.className)}>
        <Provider>
          <FrameBar />
          <Main className="flex-grow overflow-auto">{children}</Main>
        </Provider>
      </body>
    </html>
  );
}

