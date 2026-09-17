"use client";

/**
 * HeroScene — Interactive Three.js 3D Wedding Emblem
 *
 * Renders an elegant, floating 3D golden double-ring emblem that
 * gently rotates in 3D space and interactively tilts in response to mouse movement.
 * Golden point lights illuminate metallic surfaces, creating realistic reflections.
 *
 * Designed with Open Props & Apple elegance: subtle, premium, and performant.
 */

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

export interface HeroSceneHandle {
  group: THREE.Group | null;
  camera: THREE.PerspectiveCamera | null;
  scene: THREE.Scene | null;
  scrollProgress: number;
}

export interface HeroSceneProps {
  className?: string;
}

export const HeroScene = forwardRef<HeroSceneHandle, HeroSceneProps>(
  function HeroScene({ className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const groupRef = useRef<THREE.Group | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const scrollProgressRef = useRef(0);

    useEffect(() => {
      const handleScroll = (e: Event) => {
        const customEvent = e as CustomEvent<number>;
        const progress = typeof customEvent.detail === "number" ? customEvent.detail : 0;
        setScrollProgress(progress);
        scrollProgressRef.current = progress;
      };

      window.addEventListener("scroll-progress", handleScroll);
      return () => window.removeEventListener("scroll-progress", handleScroll);
    }, []);

    useImperativeHandle(ref, () => ({
      get group() {
        return groupRef.current;
      },
      get camera() {
        return cameraRef.current;
      },
      get scene() {
        return sceneRef.current;
      },
      get scrollProgress() {
        return scrollProgressRef.current;
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Dimensions
      const width = container.clientWidth || window.innerWidth || 320;
      const height = container.clientHeight || window.innerHeight || 320;

      // Scene & Camera
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 7;
      cameraRef.current = camera;

      // Renderer
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        // Graceful fallback for non-WebGL / test environments
        return;
      }

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // Group for the 3D wedding rings
      const group = new THREE.Group();
      groupRef.current = group;
      scene.add(group);

    // Gold material with metallic luster
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22,
    });

    const innerGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5d77f,
      metalness: 0.92,
      roughness: 0.18,
    });

    // Ring 1 (Torus)
    const ringGeo1 = new THREE.TorusGeometry(1.4, 0.16, 32, 100);
    const ring1 = new THREE.Mesh(ringGeo1, goldMaterial);
    ring1.rotation.x = Math.PI / 4;
    ring1.rotation.y = Math.PI / 6;
    ring1.position.x = -0.45;
    group.add(ring1);

    // Ring 2 (Intertwined Torus)
    const ringGeo2 = new THREE.TorusGeometry(1.2, 0.15, 32, 100);
    const ring2 = new THREE.Mesh(ringGeo2, innerGoldMaterial);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = -Math.PI / 4;
    ring2.position.x = 0.45;
    ring2.position.y = 0.2;
    group.add(ring2);

    // Sparkling floating micro-particles (golden specks)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf5d77f,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd700, 1.5);
    keyLight.position.set(-5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xb89047, 2, 10);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.8, 8);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Mouse interaction tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = -y * 0.35;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse tilt
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      // Base idle oscillation + mouse tilt + scroll sync
      group.rotation.y = elapsed * 0.35 + currentRotY + scrollProgressRef.current * Math.PI * 2;
      group.rotation.x = Math.sin(elapsed * 0.5) * 0.15 + currentRotX;
      group.position.y = Math.sin(elapsed * 1.2) * 0.08 + scrollProgressRef.current * -2;

      // Slowly rotate particle field
      particles.rotation.y = elapsed * 0.05;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      goldMaterial.dispose();
      innerGoldMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      groupRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-scroll-progress={scrollProgress}
      className={
        className ??
        "relative mx-auto h-[260px] w-[260px] sm:h-[320px] sm:w-[320px] cursor-grab active:cursor-grabbing select-none"
      }
      aria-label="Animação 3D interativa das alianças dos noivos"
    />
  );
});
