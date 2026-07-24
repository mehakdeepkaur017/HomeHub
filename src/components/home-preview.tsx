"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
// @ts-ignore
import homeScene from "../../public/home-scene.png";

export function InteractiveHomePreview() {
  const [isMounted, setIsMounted] = useState(false);

  // Parallax cursor effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 400, mass: 1.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  
  const floatX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const floatY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  
  const invFloatX = useTransform(floatX, (v) => -v * 0.8);
  const invFloatY = useTransform(floatY, (v) => -v * 0.8);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) return <div className="w-full max-w-[500px] aspect-[4/3]" />;

  return (
    <div className="relative w-full max-w-[540px] aspect-[4/3] flex items-center justify-center perspective-[1200px] group cursor-default ml-auto">
      
      {/* Glow behind image */}
      <div className="absolute inset-4 bg-primary/20 rounded-[3rem] blur-[60px] -z-10 transition-opacity duration-700 opacity-0 group-hover:opacity-100" />

      <motion.div 
        className="relative w-full h-full transform-style-3d shadow-2xl rounded-3xl overflow-hidden"
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <img
          src={homeScene.src || "/home-scene.png"}
          alt="Aesthetic Home Interior"
          className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
        />
        
        {/* Subtle inner shadow / overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent opacity-60" />
      </motion.div>

      {/* Floating UI Element 1 */}
      <motion.div
        className="absolute -bottom-8 -left-8 bg-background/80 backdrop-blur-xl border border-border/40 p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 pointer-events-none"
        style={{ x: floatX, y: floatY }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Living Room</p>
          <p className="text-sm font-serif">Perfectly balanced</p>
        </div>
      </motion.div>
      
      {/* Floating UI Element 2 */}
      <motion.div
        className="absolute -top-6 -right-6 bg-background/80 backdrop-blur-xl border border-border/40 p-3 rounded-2xl shadow-xl z-20 flex items-center gap-2 pointer-events-none"
        style={{ x: invFloatX, y: invFloatY }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Digital Twin Synced</span>
      </motion.div>
      
    </div>
  );
}
