'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useRef, type ReactNode } from 'react';

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  /** Scale applied while hovering. */
  scale?: number;
  glare?: boolean;
  perspective?: number;
}

/**
 * Pointer-driven 3D tilt with a soft glare highlight. Spring-based, so it
 * settles physically. Mouse-only (touch devices get the static card), and
 * disabled entirely under reduced motion.
 */
export default function Tilt({
  children,
  className,
  max = 6,
  scale = 1.015,
  glare = true,
  perspective = 1100,
}: TiltProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 24, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 180, damping: 24, mass: 0.7 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const glareX = useTransform(sx, (v) => `${Math.round(v * 100)}%`);
  const glareY = useTransform(sy, (v) => `${Math.round(v * 100)}%`);
  const glareBackground = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.16), transparent 46%)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`group/tilt ${className ?? ''}`}
      style={{ perspective: `${perspective}px` }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <motion.div
        className="relative h-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        whileHover={{ scale }}
        transition={{ type: 'spring', stiffness: 210, damping: 26, mass: 0.7 }}
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
            style={{ background: glareBackground }}
          />
        )}
      </motion.div>
    </div>
  );
}
