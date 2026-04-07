import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './particle-morph-system.css';

export function ParticleMorphSystem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initWidth = container.clientWidth || 800;
    const initHeight = container.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, initWidth / initHeight, 0.1, 100);
    // 稍微拉远一点，让图案作为背景不至于太大遮挡中间的卡片
    camera.position.z = 32;

    // 开启 alpha: true，允许完全透明
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initWidth, initHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 设置为完全透明底色，完美融合你的 UI 背景
    renderer.setClearColor(0x000000, 0);
    
    renderer.domElement.style.display = 'block'; 
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    // 可以添加 pointer-events: none 防止粒子画布阻挡用户点击后面的卡片
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const PARTICLE_COUNT = 4000;
    
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const textPositions = new Float32Array(PARTICLE_COUNT * 3);
    const scatterPositions = new Float32Array(PARTICLE_COUNT * 3);
    
    const currentColors = new Float32Array(PARTICLE_COUNT * 3);
    const textColors = new Float32Array(PARTICLE_COUNT * 3);
    const scatterColors = new Float32Array(PARTICLE_COUNT * 3);
    
    const particlesPerLetter = Math.floor(PARTICLE_COUNT / 4);
    const SCALE = 3.8; // 微调尺寸

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 1. 散开状态：模拟深沉的背景数据流（暗铜色/深咖色）
      const radius = 12 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      scatterPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      scatterPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      scatterPositions[i3 + 2] = radius * Math.cos(phi);
      
      // 极暗的暖铜色，隐入 UI 背景
      scatterColors[i3] = 0.3;     // R
      scatterColors[i3 + 1] = 0.15; // G
      scatterColors[i3 + 2] = 0.1; // B

      // 2. 聚拢状态：生成图案坐标
      const letterIndex = Math.floor(i / particlesPerLetter);
      let x = 0, y = 0;
      if (letterIndex === 0) { 
        if (Math.random() > 0.3) { x = (Math.random() - 0.5) * 1.0; y = 0.8; } else { x = 0; y = (Math.random() - 0.5) * 1.6; }
        x -= 2.0; 
      } else if (letterIndex === 1) {
        if (Math.random() > 0.3) { const t = Math.random(); x = (Math.random() > 0.5 ? 1 : -1) * 0.4 * t; y = -0.8 + t * 1.6; } else { x = (Math.random() - 0.5) * 0.4; y = 0; }
        x -= 0.6;
      } else if (letterIndex === 2) {
        const angle = Math.random() * Math.PI * 1.5 + Math.PI * 0.25; x = Math.cos(angle) * 0.5; y = Math.sin(angle) * 0.5;
        x += 0.8;
      } else if (letterIndex === 3) {
        const angle = Math.random() * Math.PI * 2; x = Math.cos(angle) * 0.5; y = Math.sin(angle) * 0.5;
        x += 2.2;
      }

      textPositions[i3] = (x + (Math.random() - 0.5) * 0.1) * SCALE;
      textPositions[i3 + 1] = (y + (Math.random() - 0.5) * 0.1) * SCALE;
      textPositions[i3 + 2] = (Math.random() - 0.5) * 0.5 * SCALE;

      // --- 关键配色修改 ---
      // 呼应 UI 的 珊瑚橙 与 鼠尾草绿渐变
      const isGreenHighlight = Math.random() > 0.85; // 15% 的几率是绿色高光
      
      if (isGreenHighlight) {
        // 鼠尾草荧光绿 (匹配 Snapshot 按钮左侧的颜色)
        textColors[i3] = 1.0;      // R
        textColors[i3 + 1] = 2.8;  // G
        textColors[i3 + 2] = 1.2;  // B
      } else {
        // 高亮珊瑚橙 (匹配图标和主题色)
        textColors[i3] = 3.5;      // R (溢出以产生辉光)
        textColors[i3 + 1] = 1.2;  // G
        textColors[i3 + 2] = 0.4;  // B
      }

      // 初始化为散开状态
      currentPositions[i3] = scatterPositions[i3];
      currentPositions[i3 + 1] = scatterPositions[i3 + 1];
      currentPositions[i3 + 2] = scatterPositions[i3 + 2];
      
      currentColors[i3] = scatterColors[i3];
      currentColors[i3 + 1] = scatterColors[i3 + 1];
      currentColors[i3 + 2] = scatterColors[i3 + 2];
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true, 
      transparent: true, 
      opacity: 0.9, 
      blending: THREE.AdditiveBlending, 
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. 渲染循环
    let animationFrameId: number;
    const animate = () => {
      const time = Date.now() * 0.001;
      
      // 保持极其柔和缓慢的节奏
      const isForming = Math.sin(time * 0.35) > 0; 
      
      const posArray = geometry.attributes.position.array as Float32Array;
      const colArray = geometry.attributes.color.array as Float32Array;

      // 物理参数：力量极小，阻尼大
      const springForce = 0.002; 
      const damping = 0.95;      
      const colorSpeed = 0.015;  

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        const targetX = isForming ? textPositions[i3] : scatterPositions[i3];
        const targetY = isForming ? textPositions[i3 + 1] : scatterPositions[i3 + 1];
        const targetZ = isForming ? textPositions[i3 + 2] : scatterPositions[i3 + 2];

        const targetR = isForming ? textColors[i3] : scatterColors[i3];
        const targetG = isForming ? textColors[i3 + 1] : scatterColors[i3 + 1];
        const targetB = isForming ? textColors[i3 + 2] : scatterColors[i3 + 2];

        velocities[i3] += (targetX - currentPositions[i3]) * springForce;
        velocities[i3 + 1] += (targetY - currentPositions[i3 + 1]) * springForce;
        velocities[i3 + 2] += (targetZ - currentPositions[i3 + 2]) * springForce;

        velocities[i3] *= damping; 
        velocities[i3 + 1] *= damping; 
        velocities[i3 + 2] *= damping;

        currentPositions[i3] += velocities[i3];
        currentPositions[i3 + 1] += velocities[i3 + 1];
        currentPositions[i3 + 2] += velocities[i3 + 2];

        posArray[i3] = currentPositions[i3];
        posArray[i3 + 1] = currentPositions[i3 + 1];
        posArray[i3 + 2] = currentPositions[i3 + 2];

        currentColors[i3] += (targetR - currentColors[i3]) * colorSpeed;
        currentColors[i3 + 1] += (targetG - currentColors[i3 + 1]) * colorSpeed;
        currentColors[i3 + 2] += (targetB - currentColors[i3 + 2]) * colorSpeed;

        colArray[i3] = currentColors[i3];
        colArray[i3 + 1] = currentColors[i3 + 1];
        colArray[i3 + 2] = currentColors[i3 + 2];
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
      // 全局极慢速自转，增加背景的空间感
      particles.rotation.y = Math.sin(time * 0.2) * 0.2;
      particles.rotation.x = Math.cos(time * 0.2) * 0.1;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="particle-morph-system" />;
}