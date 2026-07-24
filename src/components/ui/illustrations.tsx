"use client";

import { motion } from "framer-motion";

export function EmptySpacesIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <motion.svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <motion.path
          d="M20 90V40L60 10L100 40V90H20Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-primary/20"
        />
        <motion.rect
          x="45" y="60" width="30" height="30" rx="2"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-primary/40"
        />
        <motion.path
          d="M20 90H100"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-primary/60"
        />
      </motion.svg>
    </div>
  );
}

export function EmptyAssetsIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <motion.svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <motion.rect
          x="20" y="30" width="80" height="60" rx="8"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-primary/20"
        />
        <motion.circle
          cx="60" cy="60" r="15"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1, type: "spring" }}
          className="text-primary/40"
        />
        <motion.path
          d="M40 90L80 90"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-primary/60"
        />
      </motion.svg>
    </div>
  );
}

export function EmptyVaultIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <motion.svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <motion.rect
          x="30" y="20" width="60" height="80" rx="4"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-primary/20"
        />
        <motion.path
          d="M45 40H75M45 55H75M45 70H60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-primary/40"
        />
      </motion.svg>
    </div>
  );
}

export function EmptyCareIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <motion.svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <motion.circle
          cx="60" cy="60" r="40"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary/20"
        />
        <motion.path
          d="M60 35V60L75 75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-primary/60"
        />
      </motion.svg>
    </div>
  );
}

export function EmptyMoneyIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <motion.svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <motion.path
          d="M20 80C40 80 50 40 70 40C90 40 100 60 110 60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-primary/40"
        />
        <motion.circle
          cx="70" cy="40" r="4"
          fill="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
          className="text-primary"
        />
      </motion.svg>
    </div>
  );
}

export function EmptyFamilyIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <motion.svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <motion.circle cx="45" cy="50" r="15" stroke="currentColor" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-primary/40" />
        <motion.path d="M25 90C25 75 35 65 45 65C55 65 65 75 65 90" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-primary/40" />
        
        <motion.circle cx="80" cy="60" r="12" stroke="currentColor" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.8 }} className="text-primary/20" />
        <motion.path d="M65 90C65 80 72 72 80 72C88 72 95 80 95 90" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.1 }} className="text-primary/20" />
      </motion.svg>
    </div>
  );
}
