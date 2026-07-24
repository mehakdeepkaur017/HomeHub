"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

/**
 * Premium Page Header
 * Ensures consistent typographical rhythm at the top of every pillar.
 */
export function PageHeader({ title, description, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn("relative mb-12", className)}>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between relative z-10"
      >
        <div className="space-y-3 max-w-3xl">
          {breadcrumbs && (
            <div className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              {breadcrumbs}
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-primary leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-muted-foreground max-w-2xl mt-4 font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0">
            {actions}
          </div>
        )}
      </motion.div>
      
      {/* Premium ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[150%] bg-gradient-to-br from-primary/5 via-secondary/10 to-transparent blur-3xl -z-10 rounded-full opacity-60 pointer-events-none" />
    </div>
  );
}
