import { motion } from 'motion/react';
import './gradient-text.css';

interface GradientTextProps {
  children: string;
  className?: string;
  animate?: boolean;
}

export function GradientText({ children, className = '', animate = true }: GradientTextProps) {
  return (
    <motion.span
      className={`gradient-text ${animate ? 'gradient-text--animated' : ''} ${className}`}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={animate ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      } : {}}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children}
    </motion.span>
  );
}
