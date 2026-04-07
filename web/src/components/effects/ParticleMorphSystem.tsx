import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import './particle-morph-system.css';

interface ParticleTarget {
  name: string;
  positions: Float32Array;
  colors: Float32Array;
}

export function ParticleMorphSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraStateRef = useRef({
    distance: 5,
    targetDistance: 5,
    minDistance: 3,
    maxDistance: 8,
    rotation: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 },
    focusPoint: new THREE.Vector3(0, 0, 0)
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const PARTICLE_COUNT = 8000;
    
    // 场景设置
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xfaf9f7, 5, 15);
    sceneRef.current = scene;

    // 摄像机设置
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 创建特朗普头像粒子位置
    const createTrumpShape = (): { positions: Float32Array; colors: Float32Array } => {
      const positions: number[] = [];
      const colors: number[] = [];
      
      // 头部轮廓（球形）
      for (let i = 0; i < PARTICLE_COUNT * 0.4; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 0.8 + Math.random() * 0.2;
        
        positions.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) + 0.2,
          r * Math.cos(phi)
        );
        colors.push(0.1, 0.1, 0.1); // 黑色
      }

      // 标志性发型（顶部扩展）
      for (let i = 0; i < PARTICLE_COUNT * 0.2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.9;
        const height = 0.8 + Math.random() * 0.4;
        
        positions.push(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        colors.push(0.9, 0.7, 0.2); // 金色
      }

      // 红领带
      for (let i = 0; i < PARTICLE_COUNT * 0.15; i++) {
        const x = (Math.random() - 0.5) * 0.3;
        const y = -0.5 - Math.random() * 0.8;
        const z = (Math.random() - 0.5) * 0.2;
        
        positions.push(x, y, z);
        colors.push(1, 0, 0); // 红色
      }

      // 填充剩余粒子
      const remaining = PARTICLE_COUNT - positions.length / 3;
      for (let i = 0; i < remaining; i++) {
        positions.push(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5
        );
        colors.push(0.2, 0.2, 0.2);
      }

      return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors)
      };
    };

    // 创建TACO文字粒子位置
    const createTacoText = (): { positions: Float32Array; colors: Float32Array } => {
      const positions: number[] = [];
      const colors: number[] = [];
      
      const letters = [
        { char: 'T', offsetX: -1.8 },
        { char: 'A', offsetX: -0.9 },
        { char: 'C', offsetX: 0.0 },
        { char: 'O', offsetX: 0.9 }
      ];

      const particlesPerLetter = Math.floor(PARTICLE_COUNT / 4);

      letters.forEach(({ char, offsetX }) => {
        for (let i = 0; i < particlesPerLetter; i++) {
          let x = 0, y = 0;

          switch (char) {
            case 'T':
              if (Math.random() > 0.5) {
                x = (Math.random() - 0.5) * 0.6;
                y = 0.8;
              } else {
                x = 0;
                y = (Math.random() - 0.5) * 1.6;
              }
              break;
            case 'A':
              if (Math.random() > 0.3) {
                const side = Math.random() > 0.5 ? 1 : -1;
                const t = Math.random();
                x = side * 0.3 * t;
                y = -0.8 + t * 1.6;
              } else {
                x = (Math.random() - 0.5) * 0.4;
                y = 0;
              }
              break;
            case 'C':
              const angle = Math.random() * Math.PI * 1.5 + Math.PI * 0.25;
              const r = 0.5;
              x = Math.cos(angle) * r;
              y = Math.sin(angle) * r;
              break;
            case 'O':
              const theta = Math.random() * Math.PI * 2;
              const radius = 0.5;
              x = Math.cos(theta) * radius;
              y = Math.sin(theta) * radius;
              break;
          }

          positions.push(
            x + offsetX,
            y,
            (Math.random() - 0.5) * 0.3
          );
          
          // 渐变色：橙色到黄色
          const hue = 0.08 + Math.random() * 0.08;
          colors.push(1, 0.6 + hue, 0.1);
        }
      });

      return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors)
      };
    };

    // 创建富途牛牛图标粒子位置
    const createFutuNiuniuIcon = (): { positions: Float32Array; colors: Float32Array } => {
      const positions: number[] = [];
      const colors: number[] = [];

      // 牛头轮廓（椭圆）
      for (let i = 0; i < PARTICLE_COUNT * 0.3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 0.6 + Math.random() * 0.1;
        const x = Math.cos(angle) * r * 0.8;
        const y = Math.sin(angle) * r;
        
        positions.push(x, y, (Math.random() - 0.5) * 0.2);
        colors.push(0.1, 0.6, 0.9); // 富途蓝
      }

      // 牛角（两个弧形）
      for (let i = 0; i < PARTICLE_COUNT * 0.2; i++) {
        const side = i < PARTICLE_COUNT * 0.1 ? -1 : 1;
        const t = Math.random();
        const angle = t * Math.PI * 0.6;
        const r = 0.3 + t * 0.4;
        
        positions.push(
          side * (0.5 + Math.cos(angle) * r),
          0.6 + Math.sin(angle) * r,
          (Math.random() - 0.5) * 0.2
        );
        colors.push(0.9, 0.9, 0.9); // 白色牛角
      }

      // 眼睛
      for (let i = 0; i < PARTICLE_COUNT * 0.1; i++) {
        const side = i < PARTICLE_COUNT * 0.05 ? -1 : 1;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.08;
        
        positions.push(
          side * 0.25 + Math.cos(angle) * r,
          0.15 + Math.sin(angle) * r,
          0.1
        );
        colors.push(0.05, 0.05, 0.05); // 黑色眼睛
      }

      // 鼻子
      for (let i = 0; i < PARTICLE_COUNT * 0.15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.25;
        
        positions.push(
          Math.cos(angle) * r * 0.8,
          -0.3 + Math.sin(angle) * r,
          0.05
        );
        colors.push(0.95, 0.7, 0.7); // 粉红色鼻子
      }

      // 外圈装饰
      for (let i = 0; i < PARTICLE_COUNT * 0.25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 0.9 + Math.random() * 0.2;
        
        positions.push(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          (Math.random() - 0.5) * 0.3
        );
        colors.push(0.2, 0.7, 1.0); // 亮蓝色
      }

      return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors)
      };
    };

    // 创建粒子系统
    const targets: ParticleTarget[] = [
      { name: 'trump', ...createTrumpShape() },
      { name: 'taco', ...createTacoText() },
      { name: 'futu', ...createFutuNiuniuIcon() }
    ];

    const geometry = new THREE.BufferGeometry();
    const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const targetColors = new Float32Array(PARTICLE_COUNT * 3);

    // 初始化粒子位置（爆炸状态）
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      
      initialPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      initialPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      initialPositions[i3 + 2] = r * Math.cos(phi);
      
      currentPositions[i3] = initialPositions[i3];
      currentPositions[i3 + 1] = initialPositions[i3 + 1];
      currentPositions[i3 + 2] = initialPositions[i3 + 2];
      
      colors[i3] = 0.5;
      colors[i3 + 1] = 0.5;
      colors[i3 + 2] = 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Frustum Fitting: 计算最佳摄像机距离
    const calculateOptimalCameraDistance = (boundingRadius: number): number => {
      const fov = camera.fov * (Math.PI / 180);
      const aspect = camera.aspect;
      const vFOV = fov;
      const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
      
      const minFOV = Math.min(vFOV, hFOV);
      const distance = boundingRadius / Math.tan(minFOV / 2);
      
      return Math.max(
        cameraStateRef.current.minDistance,
        Math.min(cameraStateRef.current.maxDistance, distance * 1.2)
      );
    };

    // 基于焦点的相对空间向量计算
    const updateCameraFromFocus = (focusPoint: THREE.Vector3, distance: number, rotation: { x: number; y: number }) => {
      const phi = rotation.x;
      const theta = rotation.y;
      
      // 计算相对于焦点的摄像机位置
      const offset = new THREE.Vector3(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(theta),
        distance * Math.cos(phi) * Math.cos(theta)
      );
      
      camera.position.copy(focusPoint).add(offset);
      camera.lookAt(focusPoint);
    };

    // 创建15套复合型封闭循环运镜序列
    const createCameraSequences = () => {
      const sequences = [
        // 1. 环绕俯视
        { rotation: { x: Math.PI * 0.5, y: Math.PI * 0.3 }, distance: 6, duration: 2 },
        // 2. 正面拉近
        { rotation: { x: Math.PI * 0.5, y: 0 }, distance: 4, duration: 1.5 },
        // 3. 左侧观察
        { rotation: { x: Math.PI * 0.3, y: 0 }, distance: 5, duration: 1.5 },
        // 4. 右侧观察
        { rotation: { x: Math.PI * 0.7, y: 0 }, distance: 5, duration: 1.5 },
        // 5. 顶部俯瞰
        { rotation: { x: Math.PI * 0.5, y: Math.PI * 0.45 }, distance: 7, duration: 2 },
        // 6. 底部仰视
        { rotation: { x: Math.PI * 0.5, y: -Math.PI * 0.3 }, distance: 6, duration: 1.5 },
        // 7. 螺旋上升
        { rotation: { x: Math.PI * 0.8, y: Math.PI * 0.2 }, distance: 5.5, duration: 2 },
        // 8. 螺旋下降
        { rotation: { x: Math.PI * 0.2, y: -Math.PI * 0.2 }, distance: 5.5, duration: 2 },
        // 9. 快速环绕
        { rotation: { x: Math.PI * 1.5, y: 0 }, distance: 5, duration: 1 },
        // 10. 远景全览
        { rotation: { x: Math.PI * 0.5, y: Math.PI * 0.15 }, distance: 7.5, duration: 2 },
        // 11. 特写细节
        { rotation: { x: Math.PI * 0.5, y: 0 }, distance: 3.5, duration: 1.5 },
        // 12. 斜角透视
        { rotation: { x: Math.PI * 0.35, y: Math.PI * 0.25 }, distance: 5.5, duration: 1.5 },
        // 13. 反向斜角
        { rotation: { x: Math.PI * 0.65, y: -Math.PI * 0.25 }, distance: 5.5, duration: 1.5 },
        // 14. 动态追踪
        { rotation: { x: Math.PI * 0.6, y: Math.PI * 0.1 }, distance: 4.5, duration: 1.5 },
        // 15. 回归中心
        { rotation: { x: Math.PI * 0.5, y: 0 }, distance: 5, duration: 2 }
      ];
      
      return sequences;
    };

    // 粒子变形动画
    const morphToTarget = (targetIndex: number, explosionPhase: boolean = false) => {
      const target = targets[targetIndex];
      
      // 设置目标位置和颜色
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        if (explosionPhase) {
          // 爆炸阶段：粒子飞向随机方向
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 4 + Math.random() * 3;
          
          targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
          targetPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          targetPositions[i3 + 2] = r * Math.cos(phi);
          
          targetColors[i3] = 0.3;
          targetColors[i3 + 1] = 0.3;
          targetColors[i3 + 2] = 0.3;
        } else {
          // 聚合阶段：粒子形成目标形状
          targetPositions[i3] = target.positions[i3];
          targetPositions[i3 + 1] = target.positions[i3 + 1];
          targetPositions[i3 + 2] = target.positions[i3 + 2];
          
          targetColors[i3] = target.colors[i3];
          targetColors[i3 + 1] = target.colors[i3 + 1];
          targetColors[i3 + 2] = target.colors[i3 + 2];
        }
      }
    };

    // 物理模拟更新
    const updateParticles = () => {
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // 计算到目标的向量
        const dx = targetPositions[i3] - currentPositions[i3];
        const dy = targetPositions[i3 + 1] - currentPositions[i3 + 1];
        const dz = targetPositions[i3 + 2] - currentPositions[i3 + 2];
        
        // 弹簧力
        const springForce = 0.05;
        velocities[i3] += dx * springForce;
        velocities[i3 + 1] += dy * springForce;
        velocities[i3 + 2] += dz * springForce;
        
        // 阻尼
        velocities[i3] *= 0.85;
        velocities[i3 + 1] *= 0.85;
        velocities[i3 + 2] *= 0.85;
        
        // 更新位置
        currentPositions[i3] += velocities[i3];
        currentPositions[i3 + 1] += velocities[i3 + 1];
        currentPositions[i3 + 2] += velocities[i3 + 2];
        
        positions[i3] = currentPositions[i3];
        positions[i3 + 1] = currentPositions[i3 + 1];
        positions[i3 + 2] = currentPositions[i3 + 2];
        
        // 颜色插值
        colors[i3] += (targetColors[i3] - colors[i3]) * 0.05;
        colors[i3 + 1] += (targetColors[i3 + 1] - colors[i3 + 1]) * 0.05;
        colors[i3 + 2] += (targetColors[i3 + 2] - colors[i3 + 2]) * 0.05;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    };

    // 创建GSAP Timeline主循环
    const timeline = gsap.timeline({ repeat: -1 });
    timelineRef.current = timeline;

    const cameraSequences = createCameraSequences();
    let sequenceIndex = 0;

    // 特朗普 -> 爆炸 -> TACO
    timeline.call(() => {
      morphToTarget(0, false); // 特朗普
      const optimalDistance = calculateOptimalCameraDistance(1.2);
      cameraStateRef.current.targetDistance = optimalDistance;
    });
    
    // 应用前5个运镜序列
    for (let i = 0; i < 5; i++) {
      const seq = cameraSequences[sequenceIndex++ % cameraSequences.length];
      timeline.to(cameraStateRef.current.targetRotation, {
        x: seq.rotation.x,
        y: seq.rotation.y,
        duration: seq.duration,
        ease: 'power2.inOut'
      }, `>-${seq.duration * 0.3}`);
      timeline.to(cameraStateRef.current, {
        targetDistance: seq.distance,
        duration: seq.duration,
        ease: 'power2.inOut'
      }, `<`);
    }

    timeline.call(() => {
      morphToTarget(0, true); // 爆炸
    }, undefined, '+=2');

    timeline.to({}, { duration: 1.5 });

    timeline.call(() => {
      morphToTarget(1, false); // TACO
      const optimalDistance = calculateOptimalCameraDistance(2.0);
      cameraStateRef.current.targetDistance = optimalDistance;
    });

    // 应用接下来5个运镜序列
    for (let i = 0; i < 5; i++) {
      const seq = cameraSequences[sequenceIndex++ % cameraSequences.length];
      timeline.to(cameraStateRef.current.targetRotation, {
        x: seq.rotation.x,
        y: seq.rotation.y,
        duration: seq.duration,
        ease: 'power2.inOut'
      }, `>-${seq.duration * 0.3}`);
      timeline.to(cameraStateRef.current, {
        targetDistance: seq.distance,
        duration: seq.duration,
        ease: 'power2.inOut'
      }, `<`);
    }

    timeline.call(() => {
      morphToTarget(1, true); // 爆炸
    }, undefined, '+=2');

    timeline.to({}, { duration: 1.5 });

    timeline.call(() => {
      morphToTarget(2, false); // 富途牛牛
      const optimalDistance = calculateOptimalCameraDistance(1.5);
      cameraStateRef.current.targetDistance = optimalDistance;
    });

    // 应用最后5个运镜序列
    for (let i = 0; i < 5; i++) {
      const seq = cameraSequences[sequenceIndex++ % cameraSequences.length];
      timeline.to(cameraStateRef.current.targetRotation, {
        x: seq.rotation.x,
        y: seq.rotation.y,
        duration: seq.duration,
        ease: 'power2.inOut'
      }, `>-${seq.duration * 0.3}`);
      timeline.to(cameraStateRef.current, {
        targetDistance: seq.distance,
        duration: seq.duration,
        ease: 'power2.inOut'
      }, `<`);
    }

    timeline.call(() => {
      morphToTarget(2, true); // 爆炸
    }, undefined, '+=2');

    timeline.to({}, { duration: 1.5 });

    // 鼠标移动事件（影响焦点）
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 窗口调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 动画循环
    const animate = () => {

      // 平滑鼠标输入
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // 基于鼠标位置调整焦点
      cameraStateRef.current.focusPoint.x = mouseRef.current.x * 0.5;
      cameraStateRef.current.focusPoint.y = mouseRef.current.y * 0.5;

      // 平滑摄像机状态
      cameraStateRef.current.distance += (cameraStateRef.current.targetDistance - cameraStateRef.current.distance) * 0.05;
      cameraStateRef.current.rotation.x += (cameraStateRef.current.targetRotation.x - cameraStateRef.current.rotation.x) * 0.05;
      cameraStateRef.current.rotation.y += (cameraStateRef.current.targetRotation.y - cameraStateRef.current.rotation.y) * 0.05;

      // 更新摄像机位置（基于焦点的相对空间向量）
      updateCameraFromFocus(
        cameraStateRef.current.focusPoint,
        cameraStateRef.current.distance,
        cameraStateRef.current.rotation
      );

      // 更新粒子物理
      updateParticles();

      // 粒子旋转
      if (particles) {
        particles.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 清理
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (timeline) timeline.kill();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="particle-morph-system" />;
}
