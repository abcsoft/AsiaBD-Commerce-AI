'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Counts from 0 to `value` the first time it enters the viewport.
 * Writes directly to the DOM node (no per-frame React state) and renders the
 * final value for reduced-motion users and non-JS clients.
 */
export default function CountUp({
  value,
  className,
  duration = 1.1,
  prefix = '',
  suffix = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !inView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${value.toLocaleString()}${suffix}`}
    </span>
  );
}
