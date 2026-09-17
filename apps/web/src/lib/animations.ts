/**
 * animations.ts — Central animation configuration for the wedding-raffle app
 *
 * Provides:
 * - Motion.dev (motion/react) variants for consistent enter/exit/hover animations
 * - GSAP helper for animated counters
 * - Anime.js helper for SVG microinteractions
 *
 * All animations respect prefers-reduced-motion.
 */

import type { Variants, Transition } from "motion/react";

// ---------------------------------------------------------------------------
// Reduced motion check
// ---------------------------------------------------------------------------
export const prefersReducedMotion =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// ---------------------------------------------------------------------------
// Shared transitions (mapped from Open Props easings semantics)
// ---------------------------------------------------------------------------

/** Spring enter — used for cards and UI elements appearing */
export const springEnter: Transition = prefersReducedMotion
  ? { duration: 0 }
  : {
      type: "spring",
      stiffness: 280,
      damping: 22,
      mass: 0.8,
    };

/** Spring bounce — used for celebratory moments */
export const springBounce: Transition = prefersReducedMotion
  ? { duration: 0 }
  : {
      type: "spring",
      stiffness: 400,
      damping: 10,
      mass: 0.6,
    };

/** Smooth tween — used for status transitions */
export const smoothTween: Transition = prefersReducedMotion
  ? { duration: 0 }
  : {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    };

// ---------------------------------------------------------------------------
// Motion.dev variants
// ---------------------------------------------------------------------------

/** Fade up from below — page section entrance */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springEnter,
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: smoothTween,
  },
};

/** Fade in only — simple presence */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Card reveal — wedding stationery lifting off the table */
export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springEnter,
  },
};

/** Stagger container — orchestrates children one by one */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Scale pop — for celebratory moments (winner reveal, payment confirmed) */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBounce,
  },
};

/** Status transition — slide between states (pending → paid) */
export const statusSlide: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: smoothTween },
  exit: { opacity: 0, x: 16, transition: smoothTween },
};

// ---------------------------------------------------------------------------
// GSAP counter helper
// ---------------------------------------------------------------------------

/**
 * Animates a numeric value from `from` to `to` using GSAP.
 * Works with GSAP's gsap.to() — passes a proxy object to update the DOM.
 *
 * Usage:
 * ```ts
 * import gsap from "gsap"
 * import { createGSAPCounter } from "@/lib/animations"
 *
 * const counter = createGSAPCounter(element, 0, 1500, {
 *   prefix: "R$ ",
 *   decimals: 2,
 *   duration: 2,
 * });
 * ```
 */
export interface GSAPCounterOptions {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  ease?: string;
  locale?: string;
}

export function animateGSAPCounter(
  element: HTMLElement,
  from: number,
  to: number,
  options: GSAPCounterOptions = {}
) {
  const {
    prefix = "",
    suffix = "",
    decimals = 0,
    duration = 1.5,
    ease = "power2.out",
    locale = "pt-BR",
  } = options;

  if (prefersReducedMotion) {
    element.textContent =
      prefix +
      to.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
      suffix;
    return;
  }

  const obj = { value: from };

  // Dynamically import GSAP to keep bundle lazy
  import("gsap").then(({ default: gsap }) => {
    gsap.to(obj, {
      value: to,
      duration,
      ease,
      onUpdate() {
        element.textContent =
          prefix +
          obj.value.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) +
          suffix;
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Anime.js helpers
// ---------------------------------------------------------------------------

/**
 * Draws an SVG path from 0% to 100% (checkmark animation).
 * Uses Anime.js strokeDashoffset technique.
 */
export function animateSVGDraw(svgPath: SVGElement, duration = 600) {
  if (prefersReducedMotion) {
    (svgPath as SVGPathElement).style.strokeDashoffset = "0";
    return;
  }

  import("animejs").then((animeModule) => {
    const length = (svgPath as SVGPathElement).getTotalLength?.() ?? 100;
    (svgPath as SVGPathElement).style.strokeDasharray = `${length}`;
    (svgPath as SVGPathElement).style.strokeDashoffset = `${length}`;

    if (typeof animeModule.animate === "function") {
      animeModule.animate(svgPath, {
        strokeDashoffset: [length, 0],
        duration,
        ease: "easeInOutCubic",
      });
    }
  });
}

/**
 * Pulses an element with a gentle scale bounce (CTA attention).
 */
export function animatePulse(element: HTMLElement, delay = 0) {
  if (prefersReducedMotion) return;

  import("animejs").then((animeModule) => {
    if (typeof animeModule.animate === "function") {
      animeModule.animate(element, {
        scale: [1, 1.04, 1],
        duration: 800,
        delay,
        ease: "easeInOutSine",
      });
    }
  });
}
