"use client";

/**
 * MotionCard — A wedding-stationery-style card that lifts off the surface
 * on entrance using Motion.dev spring physics.
 *
 * Wraps children in a motion.div with the `cardReveal` variant pre-applied.
 * Use `<MotionCard>` anywhere you want a card to animate in gracefully.
 */

import { motion } from "motion/react";
import { cardReveal } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  /** Custom delay before the animation starts (seconds) */
  delay?: number;
  /** Whether to animate (true by default) */
  animate?: boolean;
}

export function MotionCard({
  children,
  className,
  delay = 0,
  animate = true,
}: MotionCardProps) {
  if (!animate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionSection — Fades up a page section when it enters the viewport.
 * Uses IntersectionObserver via Motion's `whileInView`.
 */
interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function MotionSection({
  children,
  className,
  delay = 0,
  once = true,
}: MotionSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        delay,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}

/**
 * MotionList — Staggers children with a slight delay between each.
 * Wrap a list of items to have them animate in one by one.
 */
interface MotionListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}

export function MotionList({
  children,
  className,
  stagger = 0.08,
}: MotionListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionItem — A single staggered item inside a MotionList.
 */
interface MotionItemProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionItem({ children, className }: MotionItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 280,
            damping: 22,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
