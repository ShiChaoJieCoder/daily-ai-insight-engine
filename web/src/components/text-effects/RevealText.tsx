import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealTextProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function RevealText({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: RevealTextProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.span>
  );
}
