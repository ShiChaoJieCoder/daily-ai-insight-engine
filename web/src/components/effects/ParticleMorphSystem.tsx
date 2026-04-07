import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import './particle-morph-system.css';

interface ParticleTarget {
  name: string;
  positions: Float32Array;
  colors: Float32Array;
  anchors: Uint8Array;
}

const TARGET_SCALE = 3;
const PACE = 1.85;

export function ParticleMorphSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraStateRef = useRef({
    distance: 5,
    targetDistance: 5,
    minDistance: 3,
    maxDistance: 8,
    rotation: { x: Math.PI * 0.5, y: 0 },
    targetRotation: { x: Math.PI * 0.5, y: 0 },
    focusPoint: new THREE.Vector3(0, 0, 0),
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const PARTICLE_COUNT = 8000;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xfaf9f7, 6, 18);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const createTrumpProfileShape = (): ParticleTarget => {
      const positions: number[] = [];
      const colors: number[] = [];
      const anchors: number[] = [];

      for (let i = 0; i < PARTICLE_COUNT * 0.42; i++) {
        const t = Math.random();
        const angle = Math.PI * (0.35 + t * 1.28);
        const x = Math.cos(angle) * 0.72 - 0.12;
        const y = Math.sin(angle) * 0.92 + 0.12;
        positions.push(x, y, (Math.random() - 0.5) * 0.28);
        colors.push(0.12, 0.12, 0.12);
        anchors.push(0);
      }
      for (let i = 0; i < PARTICLE_COUNT * 0.18; i++) {
        const t = Math.random();
        const x = -0.2 + t * 1.0;
        const y = 0.55 + Math.sin(t * Math.PI) * 0.32 + (Math.random() - 0.5) * 0.1;
        positions.push(x, y, (Math.random() - 0.5) * 0.24);
        colors.push(0.9, 0.74, 0.28);
        anchors.push(0);
      }
      for (let i = 0; i < PARTICLE_COUNT * 0.08; i++) {
        const t = Math.random();
        positions.push(
          0.32 + t * 0.28 + (Math.random() - 0.5) * 0.03,
          0.24 - t * 0.27 + (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.22,
        );
        colors.push(0.1, 0.1, 0.1);
        anchors.push(1);
      }
      for (let i = 0; i < PARTICLE_COUNT * 0.08; i++) {
        const t = Math.random();
        positions.push(
          0.56 + t * 0.26 + (Math.random() - 0.5) * 0.03,
          0.02 - t * 0.2 + (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.22,
        );
        colors.push(0.1, 0.1, 0.1);
        anchors.push(1);
      }
      for (let i = 0; i < PARTICLE_COUNT * 0.08; i++) {
        const t = Math.random();
        positions.push(
          0.52 + t * 0.23,
          -0.12 - Math.sin(t * Math.PI) * 0.1 - t * 0.14 + (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.2,
        );
        colors.push(0.12, 0.12, 0.12);
        anchors.push(1);
      }
      for (let i = 0; i < PARTICLE_COUNT * 0.1; i++) {
        positions.push(0.1 + (Math.random() - 0.5) * 0.25, -0.45 - Math.random() * 0.75, (Math.random() - 0.5) * 0.2);
        colors.push(0.95, 0.1, 0.1);
        anchors.push(0);
      }

      while (positions.length / 3 < PARTICLE_COUNT) {
        positions.push((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.3);
        colors.push(0.2, 0.2, 0.2);
        anchors.push(0);
      }

      return {
        name: 'trump-profile',
        positions: new Float32Array(positions.slice(0, PARTICLE_COUNT * 3)),
        colors: new Float32Array(colors.slice(0, PARTICLE_COUNT * 3)),
        anchors: new Uint8Array(anchors.slice(0, PARTICLE_COUNT)),
      };
    };

    const createTacoText = (): ParticleTarget => {
      const positions: number[] = [];
      const colors: number[] = [];
      const anchors: number[] = [];
      const letters = [
        { char: 'T' as const, offsetX: -1.8 },
        { char: 'A' as const, offsetX: -0.9 },
        { char: 'C' as const, offsetX: 0.0 },
        { char: 'O' as const, offsetX: 0.9 },
      ];
      const particlesPerLetter = Math.floor(PARTICLE_COUNT / 4);

      letters.forEach(({ char, offsetX }) => {
        for (let i = 0; i < particlesPerLetter; i++) {
          let x = 0;
          let y = 0;
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
            case 'C': {
              const angle = Math.random() * Math.PI * 1.5 + Math.PI * 0.25;
              x = Math.cos(angle) * 0.5;
              y = Math.sin(angle) * 0.5;
              break;
            }
            case 'O': {
              const theta = Math.random() * Math.PI * 2;
              x = Math.cos(theta) * 0.5;
              y = Math.sin(theta) * 0.5;
              break;
            }
          }
          positions.push(x + offsetX, y, (Math.random() - 0.5) * 0.3);
          const hue = 0.08 + Math.random() * 0.08;
          colors.push(1, 0.6 + hue, 0.1);
          anchors.push(Math.random() > 0.65 ? 1 : 0);
        }
      });

      while (positions.length / 3 < PARTICLE_COUNT) {
        positions.push((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.3);
        colors.push(1, 0.72, 0.2);
        anchors.push(0);
      }

      return {
        name: 'taco',
        positions: new Float32Array(positions.slice(0, PARTICLE_COUNT * 3)),
        colors: new Float32Array(colors.slice(0, PARTICLE_COUNT * 3)),
        anchors: new Uint8Array(anchors.slice(0, PARTICLE_COUNT)),
      };
    };

    const targets: ParticleTarget[] = [createTrumpProfileShape(), createTacoText()];

    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const targetColors = new Float32Array(PARTICLE_COUNT * 3);
    const anchorWeights = new Uint8Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      currentPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      currentPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      currentPositions[i3 + 2] = r * Math.cos(phi);
      colors[i3] = 0.55;
      colors[i3 + 1] = 0.55;
      colors[i3 + 2] = 0.58;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const setGalaxyExplosion = (baseRadius: number) => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const t = i / PARTICLE_COUNT;
        const arm = (i % 4) * (Math.PI / 2);
        const spin = t * Math.PI * 10;
        const radius = baseRadius * (0.35 + t * 0.9) + Math.random() * 0.4;
        const angle = arm + spin;
        targetPositions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2;
        targetPositions[i3 + 1] = (Math.random() - 0.5) * 1.4;
        targetPositions[i3 + 2] = Math.sin(angle) * radius * 0.75 + (Math.random() - 0.5) * 0.2;
        targetColors[i3] = 0.78;
        targetColors[i3 + 1] = 0.82;
        targetColors[i3 + 2] = 0.95;
      }
    };

    const morphToTarget = (targetIndex: number) => {
      const target = targets[targetIndex];
      velocities.fill(0);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        targetPositions[i3] = target.positions[i3] * TARGET_SCALE;
        targetPositions[i3 + 1] = target.positions[i3 + 1] * TARGET_SCALE;
        targetPositions[i3 + 2] = target.positions[i3 + 2] * TARGET_SCALE;
        targetColors[i3] = target.colors[i3];
        targetColors[i3 + 1] = target.colors[i3 + 1];
        targetColors[i3 + 2] = target.colors[i3 + 2];
        anchorWeights[i] = target.anchors[i];
      }
    };

    morphToTarget(0);
    const phase = { explosion: 0, swirl: 0, radiusBoost: 0, anchorBoost: 0 };

    const calculateOptimalCameraDistance = (boundingRadius: number): number => {
      const fov = camera.fov * (Math.PI / 180);
      const hFOV = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
      const minFOV = Math.min(fov, hFOV);
      const distance = boundingRadius / Math.tan(minFOV / 2);
      return Math.max(
        cameraStateRef.current.minDistance,
        Math.min(cameraStateRef.current.maxDistance, distance * 1.15),
      );
    };

    const updateCameraFromFocus = (
      focusPoint: THREE.Vector3,
      distance: number,
      rotation: { x: number; y: number },
    ) => {
      const phi = rotation.x;
      const theta = rotation.y;
      const offset = new THREE.Vector3(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(theta),
        distance * Math.cos(phi) * Math.cos(theta),
      );
      camera.position.copy(focusPoint).add(offset);
      camera.lookAt(focusPoint);
    };

    const updateParticles = () => {
      const posAttr = geometry.attributes.position.array as Float32Array;
      const colAttr = geometry.attributes.color.array as Float32Array;
      const { explosion, swirl, anchorBoost } = phase;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const dx = targetPositions[i3] - currentPositions[i3];
        const dy = targetPositions[i3 + 1] - currentPositions[i3 + 1];
        const dz = targetPositions[i3 + 2] - currentPositions[i3 + 2];

        velocities[i3] += dx * 0.038;
        velocities[i3 + 1] += dy * 0.038;
        velocities[i3 + 2] += dz * 0.038;

        const px = currentPositions[i3];
        const pz = currentPositions[i3 + 2];
        const radial = Math.max(0.001, Math.sqrt(px * px + pz * pz));
        const tangentX = -pz / radial;
        const tangentZ = px / radial;
        const outwardX = px / radial;
        const outwardZ = pz / radial;

        if (explosion > 0.001) {
          velocities[i3] += outwardX * 0.008 * explosion + tangentX * 0.0065 * swirl;
          velocities[i3 + 2] += outwardZ * 0.008 * explosion + tangentZ * 0.0065 * swirl;
          velocities[i3 + 1] += -currentPositions[i3 + 1] * 0.004 * explosion;
        } else {
          const idleDrift = 0.0005 + anchorBoost * 0.00035;
          velocities[i3] += tangentX * idleDrift;
          velocities[i3 + 2] += tangentZ * idleDrift;
        }

        velocities[i3] *= 0.905;
        velocities[i3 + 1] *= 0.905;
        velocities[i3 + 2] *= 0.905;
        currentPositions[i3] += velocities[i3];
        currentPositions[i3 + 1] += velocities[i3 + 1];
        currentPositions[i3 + 2] += velocities[i3 + 2];
        posAttr[i3] = currentPositions[i3];
        posAttr[i3 + 1] = currentPositions[i3 + 1];
        posAttr[i3 + 2] = currentPositions[i3 + 2];

        const ab = anchorBoost * anchorWeights[i];
        const tr = Math.min(1, targetColors[i3] + ab * 0.45);
        const tg = Math.min(1, targetColors[i3 + 1] + ab * 0.45);
        const tb = Math.min(1, targetColors[i3 + 2] + ab * 0.5);
        colAttr[i3] += (tr - colAttr[i3]) * 0.055;
        colAttr[i3 + 1] += (tg - colAttr[i3 + 1]) * 0.055;
        colAttr[i3 + 2] += (tb - colAttr[i3 + 2]) * 0.055;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    };

    const timeline = gsap.timeline({ repeat: -1, paused: false });
    timelineRef.current = timeline;

    const appendCycle = (targetIndex: number, nextIndex: number) => {
      const radiusHint = targetIndex === 0 ? 3.8 : 4.2;
      timeline.call(() => {
        phase.explosion = 0;
        phase.swirl = 0;
        phase.radiusBoost = 0;
        phase.anchorBoost = 0;
        morphToTarget(targetIndex);
        cameraStateRef.current.targetDistance = calculateOptimalCameraDistance(radiusHint);
      });
      timeline.to(phase, { anchorBoost: 1, duration: 0.65 * PACE, ease: 'sine.out' });
      timeline.to(phase, { anchorBoost: 0.3, duration: 0.5 * PACE, ease: 'sine.inOut' });
      timeline.to(phase, {
        explosion: 1,
        swirl: 1,
        radiusBoost: 1,
        duration: 5.2 * PACE,
        ease: 'power1.inOut',
        onStart: () => setGalaxyExplosion(4.6),
        onUpdate: () => setGalaxyExplosion(4.6 + phase.radiusBoost * 3.2),
      });
      timeline.to(phase, {
        explosion: 0.22,
        swirl: 0.78,
        duration: 3.4 * PACE,
        ease: 'sine.inOut',
        onUpdate: () => setGalaxyExplosion(6.0),
      });
      timeline.call(() => {
        phase.explosion = 0;
        phase.swirl = 0.12;
        phase.radiusBoost = 0;
        morphToTarget(nextIndex);
      });
    };

    appendCycle(0, 1);
    appendCycle(1, 0);
    timeline.play(0);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let raf = 0;
    const animate = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.032;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.032;
      cameraStateRef.current.focusPoint.x = mouseRef.current.x * 0.35;
      cameraStateRef.current.focusPoint.y = mouseRef.current.y * 0.35;
      cameraStateRef.current.distance +=
        (cameraStateRef.current.targetDistance - cameraStateRef.current.distance) * 0.026;
      cameraStateRef.current.rotation.x +=
        (cameraStateRef.current.targetRotation.x - cameraStateRef.current.rotation.x) * 0.022;
      cameraStateRef.current.rotation.y +=
        (cameraStateRef.current.targetRotation.y - cameraStateRef.current.rotation.y) * 0.022;
      updateCameraFromFocus(
        cameraStateRef.current.focusPoint,
        cameraStateRef.current.distance,
        cameraStateRef.current.rotation,
      );
      updateParticles();
      particles.rotation.y += 0.0005;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      timeline.kill();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="particle-morph-system" />;
}
