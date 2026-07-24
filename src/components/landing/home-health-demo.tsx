"use client";

import { motion } from "framer-motion";
import { HealthScore } from "@/components/ui/health-score";
import { Card } from "@/components/ui/card";
import { Box, FileText, Users, PackageOpen, Wrench } from "lucide-react";

export function HomeHealthDemo() {
  const categories = [
    { name: "Space Organization", score: 95, icon: Box, color: "text-primary" },
    { name: "Documentation", score: 88, icon: FileText, color: "text-amber-600" },
    { name: "Family Participation", score: 100, icon: Users, color: "text-forest" },
    { name: "Asset Coverage", score: 72, icon: PackageOpen, color: "text-destructive" },
    { name: "Maintenance", score: 90, icon: Wrench, color: "text-primary" },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center gap-16 py-10">
      
      {/* Massive Animated Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] -z-10 scale-150" />
        {/* We reuse the actual HealthScore component to ensure authenticity */}
        <div className="transform scale-150 origin-center">
          <HealthScore score={92} label="Excellent" />
        </div>
      </motion.div>

      {/* Live Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mt-12">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
          >
            <Card variant="display" className="p-6 h-full flex flex-col justify-between bg-card hover:-translate-y-2 transition-transform duration-500">
              <div className="p-3 bg-secondary/50 rounded-xl w-max mb-6">
                <cat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-serif mb-1">{cat.score}<span className="text-base text-muted-foreground ml-1 font-sans">%</span></p>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat.name}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
