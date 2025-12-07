// ============================================
// Framer Motion Animation Variants
// ============================================

import { Variants, Transition } from 'framer-motion';

// ============================================
// Basic Transitions
// ============================================

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInUpTransition: Transition = {
  duration: 0.2,
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleInTransition: Transition = {
  duration: 0.15,
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInFromRightTransition: Transition = {
  duration: 0.2,
};

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
};

export const slideInFromBottomTransition: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

// ============================================
// Stagger Containers
// ============================================

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// ============================================
// Repeated Animations
// ============================================

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity },
};

export const bounceAnimation = {
  y: [0, -4, 0],
  transition: { duration: 0.6, repeat: Infinity },
};

export const glowAnimation = {
  boxShadow: [
    '0 0 0 0 rgba(99, 102, 241, 0)',
    '0 0 0 8px rgba(99, 102, 241, 0.3)',
    '0 0 0 0 rgba(99, 102, 241, 0)',
  ],
  transition: { duration: 2, repeat: Infinity },
};

export const shimmerAnimation = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
};

// ============================================
// Chat-specific Animations
// ============================================

export const messageEnter: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

export const typingDot = {
  y: [0, -4, 0],
  transition: { duration: 0.6, repeat: Infinity },
};

export const actionCardEnter: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 5 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

// ============================================
// Widget Animations
// ============================================

export const streakFlame = {
  scale: [1, 1.2, 1],
  rotate: [0, 5, -5, 0],
  transition: { 
    duration: 0.5, 
    repeat: Infinity, 
    repeatDelay: 2,
  },
};

export const progressFill = {
  initial: { width: 0 },
  animate: (width: string) => ({
    width,
    transition: { duration: 0.8, ease: 'easeOut' },
  }),
};

export const numberCount = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 },
  },
};

// ============================================
// Modal & Overlay Animations
// ============================================

export const overlayFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 0.5 },
  exit: { opacity: 0 },
};

export const modalScale: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.15 },
  },
};

export const bottomSheetSlide: Variants = {
  initial: { y: '100%' },
  animate: { 
    y: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  exit: { 
    y: '100%',
    transition: { duration: 0.2 },
  },
};

// ============================================
// List Item Animations
// ============================================

export const listItemEnter: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.15 },
  },
};

export const focusQueueItem = (index: number): Variants => ({
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { delay: index * 0.1, duration: 0.2 },
  },
});

// ============================================
// Utility Functions
// ============================================

export const getStaggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * baseDelay;
};

export const createSpringTransition = (damping = 25, stiffness = 300): Transition => ({
  type: 'spring',
  damping,
  stiffness,
});

export const createEaseTransition = (duration = 0.2): Transition => ({
  duration,
  ease: 'easeOut',
});

