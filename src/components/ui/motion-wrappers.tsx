"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { fade, slideUp, slideInRight, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";
import { forwardRef } from "react";

/**
 * Reusable Motion Wrappers
 * Abstracting Framer Motion variants into semantic React components.
 */

export const FadeIn = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={fade} initial="initial" animate="animate" exit="exit" {...props}>
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

export const SlideUp = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={slideUp} initial="initial" animate="animate" exit="exit" {...props}>
      {children}
    </motion.div>
  )
);
SlideUp.displayName = "SlideUp";

export const SlideInRight = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={slideInRight} initial="initial" animate="animate" exit="exit" {...props}>
      {children}
    </motion.div>
  )
);
SlideInRight.displayName = "SlideInRight";

export const ScaleIn = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={scaleIn} initial="initial" animate="animate" exit="exit" {...props}>
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = "ScaleIn";

export const StaggerContainer = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={staggerContainer} initial="initial" animate="animate" exit="exit" {...props}>
      {children}
    </motion.div>
  )
);
StaggerContainer.displayName = "StaggerContainer";

export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = "StaggerItem";
