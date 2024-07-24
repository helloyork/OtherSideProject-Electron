import React from 'react';
import clsx from "clsx";
import { Inter } from "next/font/google";

import type { Metadata } from 'next/types';

import '@lib/styles/globals.css'
import Provider from '@lib/ui/provider';
import Main from '@lib/ui/elements/main';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Home - Nextron (with-tailwindcss)",
  description: "Electron + Next.js + tailwindcss",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx("h-full")}>
      <body className={clsx("h-full min-h-screen bg-background", inter.className)}>
        <Provider>
          <Main>{children}</Main>
        </Provider>
      </body>
    </html>
  );
}

