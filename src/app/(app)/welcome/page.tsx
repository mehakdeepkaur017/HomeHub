"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHome } from "@/components/providers/home-provider";
import { PageLoading } from "@/components/ui/page-loading";

export default function WelcomePage() {
  const router = useRouter();
  const { activeHome } = useHome();

  useEffect(() => {
    // Automatically transition to the dashboard after the magical sequence
    const timer = setTimeout(() => {
      router.push("/home");
    }, 4500);
    return () => clearTimeout(timer);
  }, [router]);

  if (!activeHome) return <PageLoading />;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        {/* Animated CSS/SVG House */}
        <div className="relative w-40 h-40 mb-12">
          {/* Soft glow behind the house */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full"
          />
          
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M10 50L50 15L90 50"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M20 42V85H80V42"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            />
            {/* Door */}
            <motion.path
              d="M40 85V60C40 57.2386 42.2386 55 45 55H55C57.7614 55 60 57.2386 60 60V85"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/70"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
            />
            {/* Windows */}
            <motion.rect
              x="28" y="55" width="8" height="8" rx="1"
              stroke="currentColor" strokeWidth="3"
              className="text-muted-foreground/50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5, ease: "backOut" }}
            />
            <motion.rect
              x="64" y="55" width="8" height="8" rx="1"
              stroke="currentColor" strokeWidth="3"
              className="text-muted-foreground/50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.7, ease: "backOut" }}
            />
          </svg>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-4xl md:text-5xl font-serif tracking-tight text-foreground mb-4"
        >
          Welcome to <span className="text-primary italic">{activeHome.name}</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="text-muted-foreground text-lg max-w-md font-light"
        >
          This will become the shared operating system for everyone who lives here.
        </motion.p>
      </motion.div>
    </div>
  );
}
