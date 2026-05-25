import { motion, useReducedMotion } from 'framer-motion';
import type { Message } from '@/lib/types';
import { messageBubbleVariants } from '@/lib/motion';
import { MessageBubble } from '@/components/conversations/MessageBubble';

export function MessageBubbleMotion({ message, index = 0 }: { message: Message; index?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <MessageBubble message={message} />;

  return (
    <motion.div
      variants={messageBubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: Math.min(index * 0.04, 0.24) }}
    >
      <MessageBubble message={message} />
    </motion.div>
  );
}
