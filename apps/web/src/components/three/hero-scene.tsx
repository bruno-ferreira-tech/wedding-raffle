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

    // Radiant 18K Yellow Gold material with warm luminescence and jewelry polish
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      emissive: 0x3e2e06,
      metalness: 0.68,
      roughness: 0.14,
    });

    const innerGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      emissive: 0x483508,
      metalness: 0.72,
      roughness: 0.12,
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

    // Diamond Solitaire on Ring 2
    const diamondGeo = new THREE.OctahedronGeometry(0.2, 2);
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 0.5,
      ior: 2.417,
      reflectivity: 0.9,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.set(0, 1.25, 0);
    diamond.rotation.z = Math.PI / 4;
    ring2.add(diamond);

    // Diamond Prong setting (4 small golden prongs)
    const prongGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8);
    const prong1 = new THREE.Mesh(prongGeo, innerGoldMaterial);
    prong1.position.set(0.1, 1.2, 0.1);
    ring2.add(prong1);
    const prong2 = new THREE.Mesh(prongGeo, innerGoldMaterial);
    prong2.position.set(-0.1, 1.2, 0.1);
    ring2.add(prong2);
    const prong3 = new THREE.Mesh(prongGeo, innerGoldMaterial);
    prong3.position.set(0.1, 1.2, -0.1);
    ring2.add(prong3);
    const prong4 = new THREE.Mesh(prongGeo, innerGoldMaterial);
    prong4.position.set(-0.1, 1.2, -0.1);
    ring2.add(prong4);

    const diamondLight = new THREE.PointLight(0xffffff, 2.5, 4);
    diamondLight.position.set(0, 1.35, 0.2);
    ring2.add(diamondLight);

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
      color: 0xffe082,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Bright, luminous jewelry lighting
    const ambientLight = new THREE.AmbientLight(0xfff8eb, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffea9f, 2.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const frontFillLight = new THREE.PointLight(0xffffff, 2.0, 12);
    frontFillLight.position.set(0, 1, 6);
    scene.add(frontFillLight);

    const goldRimLight = new THREE.PointLight(0xffc837, 3.2, 10);
    goldRimLight.position.set(-4, -1, 3);
    scene.add(goldRimLight);

    const backRimLight = new THREE.PointLight(0xffffff, 2.2, 8);
    backRimLight.position.set(0, 3, -3);
    scene.add(backRimLight);


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

      const p = Math.max(0, Math.min(1, scrollProgressRef.current));

      // Kinetic Separation Choreography:
      // At p = 0: separation = 0 (rings intertwine in the Hero stage)
      // As scroll proceeds past hero (p: 0 -> 0.22): rings glide outward to flanks
      // In the middle (p: 0.22 -> 0.80): rings stay separated at the margins framing the Bento content
      // Near bottom (p: 0.80 -> 1.0): rings smoothly converge back to center, interlocking at the CTA
      let separation = 0;
      if (p < 0.22) {
        const t = p / 0.22;
        separation = t * t * (3 - 2 * t);
      } else if (p > 0.80) {
        const t = (1 - p) / 0.20;
        separation = t * t * (3 - 2 * t);
      } else {
        separation = 1;
      }

      // Base separation distance along X axis (moving toward screen flanks)
      const maxSeparation = 2.6;
      ring1.position.x = -0.45 - separation * maxSeparation;
      ring1.position.z = separation * 0.35;
      ring1.rotation.y = Math.PI / 6 + separation * (Math.PI * 0.4);

      ring2.position.x = 0.45 + separation * maxSeparation;
      ring2.position.z = -separation * 0.35;
      ring2.rotation.y = -Math.PI / 4 - separation * (Math.PI * 0.4);

      // Base idle oscillation + mouse tilt + scroll sync
      group.rotation.y = elapsed * 0.3 + currentRotY + p * Math.PI * 2;
      group.rotation.x = Math.sin(elapsed * 0.5) * 0.12 + currentRotX;
      group.position.y = Math.sin(elapsed * 1.2) * 0.08 + p * -1.8;

      // Diamond sparkle dynamic pulsation
      diamondLight.intensity = 1.4 + Math.sin(elapsed * 4.5) * 0.8;

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
      diamondGeo.dispose();
      prongGeo.dispose();
      goldMaterial.dispose();
      innerGoldMaterial.dispose();
      diamondMat.dispose();
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
