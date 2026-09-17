"use client";

/**
 * ConfettiScene — Three.js canvas for 3D celebratory confetti.
 *
 * Used exclusively on the Telão screen when a winner is revealed.
 * Renders gold, ivory, and champagne-pink paper rectangles that fall
 * with physics-like rotation and drift.
 *
 * The component mounts the canvas full-screen (fixed position) and
 * auto-destroys after `duration` milliseconds.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ConfettiSceneProps {
  /** How many particles to spawn (default: 200) */
  count?: number;
  /** How long the scene runs in ms before cleaning up (default: 6000) */
  duration?: number;
  /** Called when the scene finishes */
  onComplete?: () => void;
}

// Wedding palette confetti colors
const COLORS = [
  0xb89047, // Champagne Gold
  0xe8d5a3, // Light Gold
  0xfaf8f5, // Ivory
  0xf3ede4, // Warm Linen
  0xc27c7c, // Blush
  0xd4b896, // Warm Sand
];

export function ConfettiScene({
  count = 200,
  duration = 6000,
  onComplete,
}: ConfettiSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const el = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Create confetti pieces (thin rectangular planes)
    const particles: {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      rx: number;
      ry: number;
      rz: number;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const width = 0.2 + Math.random() * 0.3;
      const height = 0.1 + Math.random() * 0.15;
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Start from above, spread horizontally
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        10 + Math.random() * 10,
        (Math.random() - 0.5) * 10
      );

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      scene.add(mesh);
      particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.05,
        vy: -(0.04 + Math.random() * 0.06),
        vz: (Math.random() - 0.5) * 0.02,
        rx: (Math.random() - 0.5) * 0.04,
        ry: (Math.random() - 0.5) * 0.03,
        rz: (Math.random() - 0.5) * 0.05,
      });
    }

    // Animation loop
    let animId: number;
    const startTime = Date.now();

    function animate() {
      animId = requestAnimationFrame(animate);

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      for (const p of particles) {
        p.mesh.position.x += p.vx;
        p.mesh.position.y += p.vy;
        p.mesh.position.z += p.vz;
        p.mesh.rotation.x += p.rx;
        p.mesh.rotation.y += p.ry;
        p.mesh.rotation.z += p.rz;

        // Fade out towards the end
        if (progress > 0.7) {
          (p.mesh.material as THREE.MeshBasicMaterial).opacity =
            0.9 * (1 - (progress - 0.7) / 0.3);
        }

        // Wrap particles that fall off screen
        if (p.mesh.position.y < -15) {
          p.mesh.position.y = 12;
          p.mesh.position.x = (Math.random() - 0.5) * 30;
        }
      }

      renderer.render(scene, camera);

      if (elapsed >= duration) {
        cleanup();
      }
    }

    animate();

    // Handle resize
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    function cleanup() {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      // Dispose geometries and materials
      for (const p of particles) {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.MeshBasicMaterial).dispose();
      }
      onComplete?.();
    }

    return cleanup;
  }, [count, duration, onComplete]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  );
}
