import { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  speed?: number;
  characters?: string;
  className?: string;
  trigger?: 'immediate' | 'hover';
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

export function ScrambleText({ 
  text, 
  speed = 50,
  characters = DEFAULT_CHARS,
  className = '',
  trigger = 'immediate'
}: ScrambleTextProps) {
  const [displayedText, setDisplayedText] = useState(trigger === 'immediate' ? '' : text);
  const [isScrambling, setIsScrambling] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const currentIndexRef = useRef(0);

  const scramble = () => {
    setIsScrambling(true);
    currentIndexRef.current = 0;

    const animate = () => {
      const index = currentIndexRef.current;
      
      if (index >= text.length) {
        setDisplayedText(text);
        setIsScrambling(false);
        return;
      }

      let result = text.substring(0, index);
      
      for (let i = index; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else {
          result += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      
      setDisplayedText(result);
      
      setTimeout(() => {
        currentIndexRef.current++;
        animationRef.current = requestAnimationFrame(animate);
      }, speed);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (trigger === 'immediate') {
      scramble();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger]);

  const handleMouseEnter = () => {
    if (trigger === 'hover' && !isScrambling) {
      scramble();
    }
  };

  return (
    <span 
      className={className}
      onMouseEnter={handleMouseEnter}
      style={{ cursor: trigger === 'hover' ? 'pointer' : 'default' }}
    >
      {displayedText}
    </span>
  );
}
