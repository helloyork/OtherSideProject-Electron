"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QuickButton from '../../elements/player/quick-button';
import { Clock, MoreHorizontal, MoreVertical, Save } from 'react-feather';
import clsx from 'clsx';
import { useGame } from '../../providers/game-state';

export default function QuickMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotate, setRotate] = useState(0);
  const {game, setGame} = useGame();
  const IconSize = 20;

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
    setRotate(rotate + 360);
  };
  const toggleAfm = () => {
    game.preference.afm = !game.preference.afm;
    setGame(game);
  }

  return (
    <div className="fixed top-4 left-4 flex flex-col space-y-3">
      <button
        className={clsx("w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-300 transition-colors rounded-full shadow-lg flex items-center justify-center origin-center transform")}
        onClick={toggleMenu}
      >

        <motion.div
          animate={{ rotate: rotate }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="origin-center transform"
        >
          {isExpanded ?
            <MoreVertical size={IconSize} className="origin-center transform" />
            : <MoreHorizontal size={IconSize} className="origin-center transform" />
          }

        </motion.div>
      </button>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col space-y-3"
        >
          <QuickButton className={clsx("w-24", {
            "bg-gray-200": game.preference.afm,
            "bg-white": !game.preference.afm,
          })} onClick={toggleAfm}>
            <span className="text-black font-medium">Auto</span>
          </QuickButton>
          <QuickButton>
            <Save size={IconSize} />
          </QuickButton>
          <QuickButton>
            <Clock size={IconSize} />
          </QuickButton>
        </motion.div>
      )}
    </div>
  );
}