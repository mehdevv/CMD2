import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  easeOut,
  fadeVariants,
  hoverLift,
  listItemVariants,
  pageVariants,
  scaleInVariants,
  springGentle,
  springSnappy,
  staggerContainer,
  staggerItem,
  tapScale,
} from '@/lib/motion';

function useMotionSafe() {
  return !useReducedMotion();
}

type MotionDivProps = HTMLMotionProps<'div'>;

/** Page content entrance (AppShell main area) */
export function MotionPage({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={className}
      initial={animate ? 'hidden' : false}
      animate={animate ? 'visible' : false}
      variants={pageVariants}
      transition={easeOut}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Stagger children — grids, lists, dashboard sections */
export function MotionStagger({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={className}
      initial={animate ? 'hidden' : false}
      animate={animate ? 'visible' : false}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={className}
      variants={animate ? staggerItem : undefined}
      layout={animate ? 'position' : false}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Framer-style card with hover lift */
export function MotionCard({
  className,
  children,
  hover = true,
  ...props
}: MotionDivProps & { hover?: boolean }) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={cn('scale-card scale-card-motion', className)}
      variants={animate ? scaleInVariants : undefined}
      initial={animate ? 'hidden' : false}
      animate={animate ? 'visible' : false}
      transition={springGentle}
      whileHover={animate && hover ? hoverLift : undefined}
      whileTap={animate && hover ? tapScale : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Interactive tiles (showcase, demo accounts) */
export function MotionInteractive({
  className,
  children,
  ...props
}: MotionDivProps) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={cn('scale-interactive', className)}
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={springGentle}
      whileHover={animate ? { y: -3, scale: 1.01, transition: springSnappy } : undefined}
      whileTap={animate ? tapScale : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionFade({ className, children, delay = 0, ...props }: MotionDivProps & { delay?: number }) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={className}
      initial={animate ? 'hidden' : false}
      animate={animate ? 'visible' : false}
      variants={fadeVariants}
      transition={{ ...easeOut, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** List row entrance (inbox, nav-adjacent lists) */
export function MotionListRow({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={className}
      variants={animate ? listItemVariants : undefined}
      layout={animate ? 'position' : false}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Auth / marketing split layout */
export function MotionAuthPanel({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  return (
    <motion.div
      className={className}
      initial={animate ? { opacity: 0, y: 24, scale: 0.98 } : false}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ ...easeOut, duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
