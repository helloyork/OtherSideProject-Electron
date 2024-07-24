"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import SplashScreen from '@/lib/ui/elements/splash-screen';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
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
