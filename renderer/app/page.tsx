"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import SplashScreen from '@/lib/ui/elements/splash-screen';
import { redirect, useRouter } from 'next/navigation';
import { Constants } from '@/lib/api/config';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    router.prefetch(Constants.routes.MAIN_MENU);

    const timer = setTimeout(() => {
      setIsLoading(false);
      const redirectTimer = setTimeout(() => {
        router.push(Constants.routes.MAIN_MENU);
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen />}
      </AnimatePresence>
    </>
  )
}
