'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/**
 * Thin gradient progress bar pinned to the top of marketing pages.
 * Hidden entirely for reduced-motion users.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    mass: 0.4,
  });
  const reduce = useReducedMotion();

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2.5px] origin-left bg-gradient-to-r from-[#1a63c4] via-[#2f7ef8] to-[#7fd0ff]"
      style={{ scaleX }}
    />
  );
}
