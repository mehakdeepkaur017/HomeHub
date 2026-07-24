import { Variants } from "framer-motion";

/**
 * Premium Design System Motion Presets
 * Designed to feel physical, natural, and never abrupt.
 */

// Basic Fade
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

// Slide Up (Subtle) - Used for cards and general content
export const slideUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }
};

// Slide In (Right) - Used for sidebars or flyouts
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }
};

// Staggered Children (Parent)
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    }
  }
};

// Staggered Child Element (Child)
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } 
  },
};

// Modals / Dialogs - Natural Scale
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
};

// Menus / Dropdowns - Bloom effect
export const bloom: Variants = {
  initial: { opacity: 0, scale: 0.98, y: -5 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, y: -5, transition: { duration: 0.15, ease: "easeIn" } }
};

// Interactive Hover utilities (for styled components or raw framer-motion elements)
export const hoverLift = {
  scale: 1.01,
  y: -2,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const tapCompress = {
  scale: 0.98,
  transition: { duration: 0.1, ease: "easeIn" }
};
