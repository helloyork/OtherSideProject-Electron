import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QuickButton from '../../elements/player/quick-button';
import { Clock, MoreVertical, Save } from 'react-feather';

export default function QuickMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconSize = 20;

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed top-4 left-4 flex flex-col space-y-3">
      <motion.div
        animate={{ rotate: isExpanded ? 90 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: 'center center' }}
      >
        <QuickButton onClick={toggleMenu} className="p-2 rounded-full shadow-lg">
          <MoreVertical size={IconSize} />
        </QuickButton>
      </motion.div>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col space-y-3"
        >
          <QuickButton className="w-24">
            <span className="text-black font-medium">Auto</span>
          </QuickButton>
          <QuickButton>
            <Save size={IconSize} />
          </QuickButton>
          <QuickButton>
            <Clock size={IconSize} />
          </QuickButton>
          <QuickButton onClick={toggleMenu} className="w-24">
            <span className="text-black font-medium">Close</span>
          </QuickButton>
        </motion.div>
      )}
    </div>
  );
}