"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PackageOpen, QrCode, ShieldCheck, FileText, Wrench, Bell, Activity } from "lucide-react";
import { useRef } from "react";

const journeySteps = [
  { icon: PackageOpen, title: "Buy Refrigerator", desc: "A new major asset enters your home." },
  { icon: QrCode, title: "Scan QR Label", desc: "Instantly create a digital identity in HomeHub." },
  { icon: ShieldCheck, title: "Store Warranty", desc: "Never lose the coverage terms again." },
  { icon: FileText, title: "Upload Invoice", desc: "Attached permanently to the asset record." },
  { icon: Wrench, title: "Schedule Maintenance", desc: "Set a 6-month reminder for the water filter." },
  { icon: Bell, title: "Family Receives Update", desc: "Household members are quietly notified." },
  { icon: Activity, title: "Appears in Home Feed", desc: "The activity is logged in the permanent timeline." },
];

export function CinematicTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Smooth out the scroll progress for a buttery line drawing effect
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto py-20">
      
      {/* Base Line (Faded) */}
      <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-[2px] bg-border/50 -translate-x-1/2 rounded-full" />
      
      {/* Animated Fill Line (Draws as you scroll) */}
      <motion.div 
        className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-[2px] bg-primary -translate-x-1/2 origin-top rounded-full shadow-[0_0_15px_var(--tw-colors-primary)]"
        style={{ scaleY }}
      />

      <div className="space-y-20 relative">
        {journeySteps.map((step, index) => {
          const Icon = step.icon;
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-200px 0px" }} // Trigger animation slightly before center
              className={`relative flex items-center gap-8 md:gap-16 ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}
            >
              {/* Timeline Dot (Lights up on scroll) */}
              <div className="absolute left-[27px] md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <motion.div 
                  variants={{
                    hidden: { scale: 0.8, backgroundColor: "var(--tw-colors-secondary)", borderColor: "var(--tw-colors-border)", color: "var(--tw-colors-muted-foreground)" },
                    visible: { scale: 1.2, backgroundColor: "var(--tw-colors-primary)", borderColor: "var(--tw-colors-primary)", color: "var(--tw-colors-primary-foreground)" }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-10 h-10 rounded-full border-4 shadow-sm flex items-center justify-center"
                >
                   <Icon className="w-4 h-4" />
                </motion.div>
                
                {/* Glowing ring when active */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 0.4, scale: 1.8 }
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute w-10 h-10 rounded-full bg-primary -z-10 blur-md"
                />
              </div>

              {/* Content Card (Slides in) */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: isEven ? -30 : 30, y: 20 },
                  visible: { opacity: 1, x: 0, y: 0 }
                }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className={`ml-16 md:ml-0 w-full md:w-1/2 ${isEven ? "md:pl-16 text-left" : "md:pr-16 md:text-right text-left"}`}
              >
                <Card variant="workspace" className="p-6 bg-background/50 backdrop-blur-md hover:bg-secondary/40 hover:shadow-lg transition-all duration-300 group cursor-default relative overflow-hidden">
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <h3 className="font-serif text-xl text-primary mb-2 group-hover:text-forest transition-colors">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
