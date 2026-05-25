import type { Transition, Variants } from 'framer-motion';

/** Framer-style spring — snappy but soft */
export const springSnappy = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const satisfies Transition;

export const springGentle = { type: 'spring', stiffness: 280, damping: 28, mass: 1 } as const satisfies Transition;

export const easeOut = { duration: 0.35, ease: [0.22, 1, 0.36, 1] } as const satisfies Transition;

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: springGentle },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: springGentle },
};

export const hoverLift = {
  y: -4,
  transition: springSnappy,
};

export const tapScale = { scale: 0.98 };

export const messageBubbleVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springGentle },
};
