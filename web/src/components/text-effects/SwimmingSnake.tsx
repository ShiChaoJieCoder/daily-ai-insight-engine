import { useEffect, useRef } from 'react';
import './swimming-dragon.css';

interface SwimmingDragonProps {
  containerRef: React.RefObject<HTMLElement>;
  speed?: number;
  segmentCount?: number;
}

interface DragonSegment {
  x: number;
  y: number;
  angle: number;
}

export function SwimmingSnake({ 
  containerRef, 
  speed = 1.5,
  segmentCount = 20
}: SwimmingDragonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const dragonRef = useRef<{
    segments: DragonSegment[];
    targetX: number;
    targetY: number;
    headAngle: number;
    time: number;
  }>({
    segments: [],
    targetX: 0,
    targetY: 0,
    headAngle: 0,
    time: 0
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // 设置Canvas尺寸
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateCanvasSize();

    // 初始化龙的身体（缩短长度）
    const segmentLength = 12;
    const segments: DragonSegment[] = [];
    const startX = rect.width / 2;
    const startY = rect.height / 2;

    // 使用更少的节段，让龙更简洁
    const actualSegmentCount = Math.min(segmentCount, 15);
    
    for (let i = 0; i < actualSegmentCount; i++) {
      segments.push({
        x: startX - i * segmentLength,
        y: startY,
        angle: 0
      });
    }

    dragonRef.current.segments = segments;
    dragonRef.current.targetX = startX;
    dragonRef.current.targetY = startY;

    // 绘制龙的函数
    const drawDragon = () => {
      const segments = dragonRef.current.segments;
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制优雅的龙（从尾到头）
      for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i];
        const isHead = i === 0;
        const isTail = i === segments.length - 1;
        const isNeck = i === 1 || i === 2;
        
        // 优雅的宽度曲线（头部适中，颈部细，身体渐宽，尾部细）
        const progress = i / segments.length;
        let width;
        if (isHead) {
          width = 16;
        } else if (isNeck) {
          width = 8;
        } else if (isTail) {
          width = 3;
        } else {
          const bodyProgress = (i - 2) / (segments.length - 3);
          width = 8 + Math.sin(bodyProgress * Math.PI) * 6;
        }
        
        // 优雅的金色渐变 + 木质纹理
        const alpha = 0.65 - progress * 0.2;
        const hue = 35 + Math.sin(progress * Math.PI) * 10;
        
        // 使用HSL创建更自然的木质金色
        ctx.fillStyle = `hsla(${hue}, 70%, ${45 - progress * 10}%, ${alpha})`;
        ctx.strokeStyle = `hsla(${hue}, 60%, ${35 - progress * 10}%, ${alpha + 0.1})`;
        ctx.lineWidth = 1;

        ctx.save();
        ctx.translate(segment.x, segment.y);
        ctx.rotate(segment.angle);

        if (isHead) {
          // 优雅的龙头设计
          ctx.beginPath();
          
          // 上颚
          ctx.moveTo(18, 0);
          ctx.quadraticCurveTo(15, -7, 8, -9);
          ctx.lineTo(-2, -8);
          ctx.quadraticCurveTo(-8, -7, -10, -4);
          
          // 下颚
          ctx.lineTo(-10, 4);
          ctx.quadraticCurveTo(-8, 7, -2, 8);
          ctx.lineTo(8, 9);
          ctx.quadraticCurveTo(15, 7, 18, 0);
          
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 优雅的龙角（单对，向后弯曲）
          ctx.strokeStyle = `hsla(${hue}, 70%, 40%, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(2, -9);
          ctx.quadraticCurveTo(0, -14, -3, -16);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(2, 9);
          ctx.quadraticCurveTo(0, 14, -3, 16);
          ctx.stroke();

          // 龙眼（优雅的杏仁形）
          ctx.fillStyle = 'rgba(255, 220, 100, 0.95)';
          ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
          ctx.shadowBlur = 6;
          
          // 上眼睛
          ctx.beginPath();
          ctx.ellipse(6, -4, 3.5, 2.5, -0.2, 0, Math.PI * 2);
          ctx.fill();
          
          // 下眼睛
          ctx.beginPath();
          ctx.ellipse(6, 4, 3.5, 2.5, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 瞳孔（竖瞳）
          ctx.fillStyle = 'rgba(20, 10, 0, 0.9)';
          ctx.beginPath();
          ctx.ellipse(7, -4, 1, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(7, 4, 1, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // 优雅的龙须（更细更长）
          const whiskerWave = Math.sin(dragonRef.current.time * 0.04);
          ctx.strokeStyle = `hsla(${hue}, 65%, 45%, ${alpha * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(12, -6);
          ctx.bezierCurveTo(
            20 + whiskerWave * 4, -8,
            28, -6 + whiskerWave * 6,
            35, -4 + whiskerWave * 8
          );
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(12, 6);
          ctx.bezierCurveTo(
            20 - whiskerWave * 4, 8,
            28, 6 - whiskerWave * 6,
            35, 4 - whiskerWave * 8
          );
          ctx.stroke();
        } else {
          // 优雅的龙身（圆润的椭圆）
          ctx.beginPath();
          ctx.ellipse(0, 0, segmentLength / 1.8, width / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 木质纹理（更细腻）
          if (i % 2 === 0) {
            ctx.fillStyle = `hsla(${hue + 5}, 60%, ${50 - progress * 8}%, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, segmentLength / 2.5, width / 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // 优雅的龙鳍（更小更精致）
          if (i % 4 === 0 && i > 3 && i < segments.length - 3) {
            const finWave = Math.sin(dragonRef.current.time * 0.08 - i * 0.5);
            const finSize = width * 0.6;
            
            ctx.fillStyle = `hsla(${hue}, 65%, 50%, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
              -finSize * 0.7, 
              (-finSize * 1.2 + finWave * 3), 
              -finSize * 0.4, 
              finWave * 2
            );
            ctx.closePath();
            ctx.fill();
            
            // 龙鳍边缘
            ctx.strokeStyle = `hsla(${hue}, 60%, 40%, ${alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        ctx.restore();
      }
    };

    // 更新龙的位置
    const updateDragon = () => {
      const dragon = dragonRef.current;
      const segments = dragon.segments;
      dragon.time += 1;

      // 每隔一段时间改变目标位置（更慢，更优雅）
      if (dragon.time % 180 === 0) {
        dragon.targetX = Math.random() * (canvas.width - 100) + 50;
        dragon.targetY = Math.random() * (canvas.height - 100) + 50;
      }

      // 计算头部朝向目标的角度
      const head = segments[0];
      const dx = dragon.targetX - head.x;
      const dy = dragon.targetY - head.y;
      const targetAngle = Math.atan2(dy, dx);

      // 平滑转向（更慢，更优雅）
      let angleDiff = targetAngle - dragon.headAngle;
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      dragon.headAngle += angleDiff * 0.03;

      // 添加龙形波动（更大幅度，更慢）
      const waveAmplitude = 0.4;
      const waveFrequency = 0.03;
      const waveAngle = Math.sin(dragon.time * waveFrequency) * waveAmplitude;

      // 更新头部位置（速度减慢）
      head.x += Math.cos(dragon.headAngle + waveAngle) * speed * 0.7;
      head.y += Math.sin(dragon.headAngle + waveAngle) * speed * 0.7;
      head.angle = dragon.headAngle + waveAngle;

      // 边界检测和反弹
      if (head.x < 30 || head.x > canvas.width - 30) {
        dragon.headAngle = Math.PI - dragon.headAngle;
        dragon.targetX = canvas.width / 2;
      }
      if (head.y < 30 || head.y > canvas.height - 30) {
        dragon.headAngle = -dragon.headAngle;
        dragon.targetY = canvas.height / 2;
      }

      // 更新身体节段（跟随头部）
      for (let i = 1; i < segments.length; i++) {
        const current = segments[i];
        const previous = segments[i - 1];

        const dx = previous.x - current.x;
        const dy = previous.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > segmentLength) {
          const angle = Math.atan2(dy, dx);
          current.x = previous.x - Math.cos(angle) * segmentLength;
          current.y = previous.y - Math.sin(angle) * segmentLength;
          
          // 添加身体扭动（更大幅度）
          const bodyWave = Math.sin(dragon.time * waveFrequency - i * 0.2) * waveAmplitude * 0.6;
          current.angle = angle + bodyWave;
        }
      }
    };

    // 动画循环
    const animate = () => {
      updateDragon();
      drawDragon();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 窗口大小改变时更新Canvas
    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, speed, segmentCount]);

  return (
    <canvas
      ref={canvasRef}
      className="swimming-dragon-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
}
