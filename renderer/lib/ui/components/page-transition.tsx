"use client";

import clsx from 'clsx';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
    },
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    }
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
};

const PageTransition = ({ children, className }) => (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={clsx(className)}
    >
        {children}
    </motion.div>
);

export default PageTransition;