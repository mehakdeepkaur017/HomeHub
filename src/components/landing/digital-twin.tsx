"use client";

import { motion, useScroll, useTransform, cubicBezier } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, FileText, ShieldCheck, Box } from "lucide-react";

export function DigitalTwinDemo() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const easePhysical = cubicBezier(0.2, 0.9, 0.3, 1);

  // Scroll animations for attachments
  const qrOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const qrY = useTransform(scrollYProgress, [0.3, 0.4], [30, 0]);

  const docOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  const docX = useTransform(scrollYProgress, [0.4, 0.5], [-30, 0]);

  const warrantyOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  const warrantyX = useTransform(scrollYProgress, [0.5, 0.6], [30, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] flex items-center justify-center perspective-[1000px]">
      
      {/* Central Object (The "Physical" Room/Asset) */}
      <motion.div 
        className="relative z-10"
        style={{ rotateX: useTransform(scrollYProgress, [0, 1], [10, -5]) }}
      >
        <Card variant="display" className="p-8 w-[320px] bg-background shadow-2xl border-primary/10 flex flex-col items-center justify-center aspect-square rounded-[3rem]">
          <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
            <Box className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-serif text-2xl text-primary mb-2">Living Room</h3>
          <p className="text-body text-muted-foreground text-center">Physical space mapping.</p>
        </Card>
      </motion.div>

      {/* Floating Attachment: QR Code */}
      <motion.div 
        className="absolute top-[10%] left-[55%] z-20"
        style={{ opacity: qrOpacity, y: qrY }}
      >
        <Card variant="floating" className="p-3 flex items-center gap-3 w-48 bg-background">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">QR Generated</p>
            <p className="text-[10px] text-muted-foreground">ID: LR-001</p>
          </div>
        </Card>
      </motion.div>

      {/* Floating Attachment: Document */}
      <motion.div 
        className="absolute top-[40%] left-[10%] z-20"
        style={{ opacity: docOpacity, x: docX }}
      >
        <Card variant="floating" className="p-4 w-56 bg-background">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-secondary rounded-lg">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-semibold">Floorplan.pdf</p>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full" />
          <div className="h-1.5 w-4/5 bg-secondary rounded-full mt-2" />
        </Card>
      </motion.div>

      {/* Floating Attachment: Warranty */}
      <motion.div 
        className="absolute bottom-[20%] right-[15%] z-20"
        style={{ opacity: warrantyOpacity, x: warrantyX }}
      >
        <Card variant="floating" className="p-4 w-52 bg-background flex flex-col items-start gap-3">
          <Badge variant="outline" className="border-forest/30 text-forest bg-forest/5">Protected</Badge>
          <div>
            <p className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Insurance Policy
            </p>
            <p className="text-xs text-muted-foreground mt-1">Active until 2026</p>
          </div>
        </Card>
      </motion.div>

      {/* Animated Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <motion.line 
          x1="50%" y1="50%" x2="55%" y2="15%" 
          stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 4"
          style={{ opacity: useTransform(scrollYProgress, [0.35, 0.4], [0, 0.3]) }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="20%" y2="45%" 
          stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 4"
          style={{ opacity: useTransform(scrollYProgress, [0.45, 0.5], [0, 0.3]) }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="80%" y2="75%" 
          stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 4"
          style={{ opacity: useTransform(scrollYProgress, [0.55, 0.6], [0, 0.3]) }}
        />
      </svg>
    </div>
  );
}
