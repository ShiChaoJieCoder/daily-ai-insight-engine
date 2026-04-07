import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import './swimming-fish.css';

interface SwimmingFishProps {
  containerRef: React.RefObject<HTMLElement>;
  speed?: number;
  size?: number;
}

export function SwimmingFish({ 
  containerRef, 
  speed = 2,
  size = 40 
}: SwimmingFishProps) {
  const fishRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [flipX, setFlipX] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // 初始化随机位置
    setPosition({
      x: Math.random() * (rect.width - size),
      y: Math.random() * (rect.height - size)
    });

    let currentPos = { 
      x: Math.random() * (rect.width - size), 
      y: Math.random() * (rect.height - size) 
    };
    let currentDir = { x: 1, y: 0.5 };
    let targetAngle = Math.random() * Math.PI * 2;
    let changeDirectionTimer = 0;

    const animate = () => {
      const containerRect = container.getBoundingClientRect();
      const maxX = containerRect.width - size;
      const maxY = containerRect.height - size;

      // 每隔一段时间改变方向
      changeDirectionTimer++;
      if (changeDirectionTimer > 100 + Math.random() * 100) {
        targetAngle = Math.random() * Math.PI * 2;
        changeDirectionTimer = 0;
      }

      // 平滑过渡到目标角度
      const currentAngle = Math.atan2(currentDir.y, currentDir.x);
      let angleDiff = targetAngle - currentAngle;
      
      // 标准化角度差
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const newAngle = currentAngle + angleDiff * 0.05;
      currentDir = {
        x: Math.cos(newAngle),
        y: Math.sin(newAngle)
      };

      // 更新位置
      currentPos.x += currentDir.x * speed;
      currentPos.y += currentDir.y * speed;

      // 边界检测和反弹
      if (currentPos.x <= 0 || currentPos.x >= maxX) {
        currentDir.x *= -1;
        currentPos.x = Math.max(0, Math.min(maxX, currentPos.x));
        targetAngle = Math.atan2(currentDir.y, currentDir.x);
      }
      if (currentPos.y <= 0 || currentPos.y >= maxY) {
        currentDir.y *= -1;
        currentPos.y = Math.max(0, Math.min(maxY, currentPos.y));
        targetAngle = Math.atan2(currentDir.y, currentDir.x);
      }

      // 更新小鱼朝向
      setFlipX(currentDir.x < 0);
      
      setPosition({ x: currentPos.x, y: currentPos.y });

      // 更新文字形状排除区域
      if (fishRef.current) {
        const fishCenterX = currentPos.x + size / 2;
        const fishCenterY = currentPos.y + size / 2;
        const radius = size * 0.8;

        container.style.shapeOutside = `circle(${radius}px at ${fishCenterX}px ${fishCenterY}px)`;
        container.style.clipPath = 'none';
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      container.style.shapeOutside = 'none';
    };
  }, [containerRef, speed, size]);

  return (
    <motion.div
      ref={fishRef}
      className="swimming-fish"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transform: flipX ? 'scaleX(-1)' : 'scaleX(1)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      animate={{
        rotate: [0, -5, 0, 5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        {/* 鱼身 */}
        <ellipse
          cx="50"
          cy="50"
          rx="25"
          ry="15"
          fill="url(#fishGradient)"
          stroke="currentColor"
          strokeWidth="1"
        />
        
        {/* 鱼尾 */}
        <motion.path
          d="M 25 50 Q 15 40, 10 45 Q 15 50, 10 55 Q 15 60, 25 50 Z"
          fill="url(#fishGradient)"
          stroke="currentColor"
          strokeWidth="1"
          animate={{
            d: [
              "M 25 50 Q 15 40, 10 45 Q 15 50, 10 55 Q 15 60, 25 50 Z",
              "M 25 50 Q 12 42, 8 47 Q 12 50, 8 53 Q 12 58, 25 50 Z",
              "M 25 50 Q 15 40, 10 45 Q 15 50, 10 55 Q 15 60, 25 50 Z",
            ]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* 鱼鳍 */}
        <motion.ellipse
          cx="45"
          cy="60"
          rx="8"
          ry="12"
          fill="url(#fishGradient)"
          opacity="0.7"
          animate={{
            ry: [12, 10, 12],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* 眼睛 */}
        <circle cx="65" cy="45" r="3" fill="white" />
        <circle cx="66" cy="45" r="1.5" fill="black" />
        
        {/* 气泡 */}
        <motion.g
          animate={{
            opacity: [0, 1, 0],
            y: [0, -10],
            scale: [0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <circle cx="80" cy="50" r="2" fill="white" opacity="0.6" />
          <circle cx="85" cy="48" r="1.5" fill="white" opacity="0.5" />
        </motion.g>

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="fishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="50%" stopColor="var(--positive)" />
            <stop offset="100%" stopColor="var(--accent-muted)" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
