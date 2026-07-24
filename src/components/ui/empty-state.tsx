"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, illustration, title, description, actionLabel, onAction, actionHref, children }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center justify-center p-16 text-center bg-card/20 rounded-[3rem] relative overflow-hidden w-full group transition-all duration-700"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      {illustration ? (
        <div className="relative z-10">{illustration}</div>
      ) : Icon ? (
        <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center mb-8 text-primary shadow-sm border border-border/50 group-hover:scale-105 group-hover:shadow-md transition-all duration-700 relative z-10">
          <Icon className="h-10 w-10 stroke-[1.5]" />
        </div>
      ) : null}
      
      <h3 className="text-xl font-serif text-primary tracking-tight mb-2 relative z-10">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed relative z-10">
        {description}
      </p>
      
      {actionLabel && (onAction || actionHref) && (
        actionHref ? (
          <Link href={actionHref} className="inline-flex items-center justify-center h-10 px-8 rounded-full shadow-sm hover:scale-[1.02] transition-transform relative z-10 font-medium bg-primary text-primary-foreground">
            {actionLabel}
          </Link>
        ) : (
          <Button onClick={onAction} className="rounded-full px-8 shadow-sm hover:scale-[1.02] transition-transform relative z-10 font-medium">
            {actionLabel}
          </Button>
        )
      )}

      {children && (
        <div className="mt-8 w-full max-w-md">
          {children}
        </div>
      )}
    </motion.div>
  );
}
