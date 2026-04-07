import { useEffect, useRef, useState } from 'react';
import './particle-portrait.css';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  explosionVx?: number;
  explosionVy?: number;
}

type ShapeType = 'trump' | 'taco' | 'futu';

interface ParticlePortraitProps {
  width?: number;
  height?: number;
  particleCount?: number;
}

export function ParticlePortrait({ 
  width = window.innerWidth, 
  height = window.innerHeight,
  particleCount = 4000
}: ParticlePortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState<ShapeType>('trump');
  const [isExploding, setIsExploding] = useState(false);
  const shapeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 使用设备像素比以获得更清晰的渲染
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 创建特朗普头像的像素数据
    const createTrumpPortrait = () => {
      const portraitCanvas = document.createElement('canvas');
      portraitCanvas.width = 200;
      portraitCanvas.height = 240;
      const portraitCtx = portraitCanvas.getContext('2d');
      if (!portraitCtx) return null;

      // 绘制特朗普头像轮廓
      portraitCtx.fillStyle = '#000000';
      
      // 头部轮廓（椭圆）
      portraitCtx.beginPath();
      portraitCtx.ellipse(100, 120, 70, 85, 0, 0, Math.PI * 2);
      portraitCtx.fill();

      // 标志性发型
      portraitCtx.beginPath();
      portraitCtx.moveTo(30, 80);
      portraitCtx.quadraticCurveTo(50, 30, 100, 40);
      portraitCtx.quadraticCurveTo(150, 30, 170, 80);
      portraitCtx.quadraticCurveTo(150, 70, 100, 65);
      portraitCtx.quadraticCurveTo(50, 70, 30, 80);
      portraitCtx.fill();

      // 额头
      portraitCtx.fillRect(60, 80, 80, 30);

      // 眼睛区域
      portraitCtx.fillRect(60, 110, 25, 15);
      portraitCtx.fillRect(115, 110, 25, 15);

      // 鼻子
      portraitCtx.beginPath();
      portraitCtx.moveTo(100, 125);
      portraitCtx.lineTo(95, 145);
      portraitCtx.lineTo(105, 145);
      portraitCtx.closePath();
      portraitCtx.fill();

      // 嘴巴
      portraitCtx.beginPath();
      portraitCtx.ellipse(100, 165, 25, 8, 0, 0, Math.PI * 2);
      portraitCtx.fill();

      // 下巴
      portraitCtx.beginPath();
      portraitCtx.ellipse(100, 185, 50, 30, 0, 0, Math.PI);
      portraitCtx.fill();

      // 领带（标志性红领带）
      portraitCtx.fillStyle = '#FF0000';
      portraitCtx.beginPath();
      portraitCtx.moveTo(100, 180);
      portraitCtx.lineTo(90, 240);
      portraitCtx.lineTo(100, 235);
      portraitCtx.lineTo(110, 240);
      portraitCtx.closePath();
      portraitCtx.fill();

      return portraitCtx.getImageData(0, 0, 200, 240);
    };

    // 创建TACO图形
    const createTacoShape = () => {
      const tacoCanvas = document.createElement('canvas');
      tacoCanvas.width = 240;
      tacoCanvas.height = 180;
      const tacoCtx = tacoCanvas.getContext('2d');
      if (!tacoCtx) return null;

      // TACO外壳（黄色）
      tacoCtx.fillStyle = '#FFD700';
      tacoCtx.beginPath();
      tacoCtx.arc(120, 90, 80, 0, Math.PI, true);
      tacoCtx.lineTo(180, 90);
      tacoCtx.quadraticCurveTo(190, 100, 180, 110);
      tacoCtx.lineTo(60, 110);
      tacoCtx.quadraticCurveTo(50, 100, 60, 90);
      tacoCtx.closePath();
      tacoCtx.fill();

      // 外壳纹理
      tacoCtx.strokeStyle = '#FFA500';
      tacoCtx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const x = 60 + i * 15;
        tacoCtx.beginPath();
        tacoCtx.moveTo(x, 90);
        tacoCtx.lineTo(x + 10, 110);
        tacoCtx.stroke();
      }

      // 生菜（绿色）
      tacoCtx.fillStyle = '#90EE90';
      for (let i = 0; i < 6; i++) {
        const x = 70 + i * 18;
        const y = 75 + Math.sin(i) * 5;
        tacoCtx.beginPath();
        tacoCtx.ellipse(x, y, 12, 8, Math.PI / 4, 0, Math.PI * 2);
        tacoCtx.fill();
      }

      // 番茄（红色）
      tacoCtx.fillStyle = '#FF6347';
      for (let i = 0; i < 5; i++) {
        const x = 75 + i * 20;
        const y = 65 + Math.cos(i) * 3;
        tacoCtx.beginPath();
        tacoCtx.arc(x, y, 6, 0, Math.PI * 2);
        tacoCtx.fill();
      }

      // 奶酪（黄色）
      tacoCtx.fillStyle = '#FFFF00';
      for (let i = 0; i < 4; i++) {
        const x = 80 + i * 25;
        const y = 55;
        tacoCtx.fillRect(x, y, 15, 8);
      }

      // 肉（棕色）
      tacoCtx.fillStyle = '#8B4513';
      tacoCtx.fillRect(70, 80, 100, 12);

      return tacoCtx.getImageData(0, 0, 240, 180);
    };

    // 创建富途牛牛图标
    const createFutuBull = () => {
      const futuCanvas = document.createElement('canvas');
      futuCanvas.width = 200;
      futuCanvas.height = 200;
      const futuCtx = futuCanvas.getContext('2d');
      if (!futuCtx) return null;

      // 牛头（深蓝色）
      futuCtx.fillStyle = '#1E3A8A';
      futuCtx.beginPath();
      futuCtx.ellipse(100, 120, 60, 50, 0, 0, Math.PI * 2);
      futuCtx.fill();

      // 牛角（白色）
      futuCtx.fillStyle = '#FFFFFF';
      // 左角
      futuCtx.beginPath();
      futuCtx.moveTo(50, 100);
      futuCtx.quadraticCurveTo(30, 80, 35, 60);
      futuCtx.quadraticCurveTo(40, 70, 55, 95);
      futuCtx.closePath();
      futuCtx.fill();
      // 右角
      futuCtx.beginPath();
      futuCtx.moveTo(150, 100);
      futuCtx.quadraticCurveTo(170, 80, 165, 60);
      futuCtx.quadraticCurveTo(160, 70, 145, 95);
      futuCtx.closePath();
      futuCtx.fill();

      // 牛鼻子（浅蓝色）
      futuCtx.fillStyle = '#60A5FA';
      futuCtx.beginPath();
      futuCtx.ellipse(100, 130, 35, 25, 0, 0, Math.PI * 2);
      futuCtx.fill();

      // 鼻孔
      futuCtx.fillStyle = '#1E3A8A';
      futuCtx.beginPath();
      futuCtx.arc(85, 130, 5, 0, Math.PI * 2);
      futuCtx.arc(115, 130, 5, 0, Math.PI * 2);
      futuCtx.fill();

      // 眼睛
      futuCtx.fillStyle = '#FFFFFF';
      futuCtx.beginPath();
      futuCtx.arc(75, 110, 12, 0, Math.PI * 2);
      futuCtx.arc(125, 110, 12, 0, Math.PI * 2);
      futuCtx.fill();

      // 瞳孔
      futuCtx.fillStyle = '#000000';
      futuCtx.beginPath();
      futuCtx.arc(75, 110, 6, 0, Math.PI * 2);
      futuCtx.arc(125, 110, 6, 0, Math.PI * 2);
      futuCtx.fill();

      // 耳朵
      futuCtx.fillStyle = '#1E3A8A';
      // 左耳
      futuCtx.beginPath();
      futuCtx.ellipse(55, 95, 15, 25, -Math.PI / 6, 0, Math.PI * 2);
      futuCtx.fill();
      // 右耳
      futuCtx.beginPath();
      futuCtx.ellipse(145, 95, 15, 25, Math.PI / 6, 0, Math.PI * 2);
      futuCtx.fill();

      // 富途标志（金色圆圈）
      futuCtx.strokeStyle = '#FFD700';
      futuCtx.lineWidth = 4;
      futuCtx.beginPath();
      futuCtx.arc(100, 120, 70, 0, Math.PI * 2);
      futuCtx.stroke();

      return futuCtx.getImageData(0, 0, 200, 200);
    };

    // 根据当前形状获取图像数据
    const getImageDataForShape = (shape: ShapeType) => {
      switch (shape) {
        case 'trump':
          return createTrumpPortrait();
        case 'taco':
          return createTacoShape();
        case 'futu':
          return createFutuBull();
        default:
          return createTrumpPortrait();
      }
    };

    const imageData = getImageDataForShape(currentShape);
    if (!imageData) return;

    // 从图像数据中提取粒子位置
    const extractParticles = (imgData: ImageData, shape: ShapeType) => {
      const particles: Particle[] = [];
      const sampling = 2;

      for (let y = 0; y < imgData.height; y += sampling) {
        for (let x = 0; x < imgData.width; x += sampling) {
          const index = (y * imgData.width + x) * 4;
          const alpha = imgData.data[index + 3];

          if (alpha > 128) {
            const r = imgData.data[index];
            const g = imgData.data[index + 1];
            const b = imgData.data[index + 2];
            
            // 根据不同形状调整映射位置
            let offsetX = 0, offsetY = 0;
            if (shape === 'trump') {
              offsetX = 100;
              offsetY = 120;
            } else if (shape === 'taco') {
              offsetX = 120;
              offsetY = 90;
            } else if (shape === 'futu') {
              offsetX = 100;
              offsetY = 100;
            }

            const targetX = (width / 2) - offsetX + x;
            const targetY = (height / 2) - offsetY + y;

            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              targetX,
              targetY,
              vx: 0,
              vy: 0,
              size: Math.random() * 2.5 + 1,
              color: `rgb(${r}, ${g}, ${b})`,
              alpha: 0.7
            });
          }
        }
      }

      return particles
        .sort(() => Math.random() - 0.5)
        .slice(0, particleCount);
    };

    particlesRef.current = extractParticles(imageData, currentShape);

    // 鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // 形状切换逻辑
    const switchShape = () => {
      setIsExploding(true);
      
      // 爆炸效果
      particlesRef.current.forEach((particle) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 10;
        particle.explosionVx = Math.cos(angle) * speed;
        particle.explosionVy = Math.sin(angle) * speed;
      });

      // 1秒后切换到下一个形状
      setTimeout(() => {
        setCurrentShape((prev) => {
          if (prev === 'trump') return 'taco';
          if (prev === 'taco') return 'futu';
          return 'trump';
        });
        setIsExploding(false);
      }, 1000);
    };

    // 设置形状切换定时器
    shapeTimerRef.current = window.setInterval(() => {
      switchShape();
    }, 6000); // 每6秒切换一次

    // 动画循环
    const animate = () => {
      ctx.fillStyle = 'rgba(250, 250, 249, 0.08)';
      ctx.fillRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        if (isExploding) {
          // 爆炸状态
          particle.x += particle.explosionVx || 0;
          particle.y += particle.explosionVy || 0;
          
          // 重力效果
          if (particle.explosionVy !== undefined) {
            particle.explosionVy += 0.3;
          }
          
          // 减速
          if (particle.explosionVx !== undefined) {
            particle.explosionVx *= 0.98;
          }
        } else {
          // 正常状态
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;

          // 鼠标排斥力
          const mouseDx = particle.x - mouseRef.current.x;
          const mouseDy = particle.y - mouseRef.current.y;
          const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
          const mouseForce = Math.max(0, 150 - mouseDistance) / 150;

          // 弹簧力（吸引到目标位置）
          const springForce = isExploding ? 0.15 : 0.06;
          particle.vx += dx * springForce;
          particle.vy += dy * springForce;

          // 鼠标排斥力
          if (mouseDistance < 150) {
            particle.vx += (mouseDx / mouseDistance) * mouseForce * 3;
            particle.vy += (mouseDy / mouseDistance) * mouseForce * 3;
          }

          // 阻尼
          particle.vx *= 0.88;
          particle.vy *= 0.88;

          // 更新位置
          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        // 绘制粒子
        const mouseDx = particle.x - mouseRef.current.x;
        const mouseDy = particle.y - mouseRef.current.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        const mouseForce = Math.max(0, 150 - mouseDistance) / 150;

        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha * (1 - mouseForce * 0.5);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    // 延迟启动动画
    setTimeout(() => {
      animate();
    }, 100);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [width, height, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-portrait"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto',
        opacity: 0.3,
      }}
    />
  );
}
