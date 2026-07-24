"use client";

import { motion } from "framer-motion";
import { AlertCircle, Clock, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AttentionCenter as AttentionCenterType } from "@/lib/intelligence/recommendations";
import { cn } from "@/lib/utils";

interface AttentionCenterProps {
  attention: AttentionCenterType;
}

export function AttentionCenter({ attention }: AttentionCenterProps) {
  const allItems = [
    ...attention.urgent.map(i => ({ ...i, priority: "urgent" as const })),
    ...attention.upcoming.map(i => ({ ...i, priority: "upcoming" as const })),
    ...attention.suggestions.map(i => ({ ...i, priority: "suggestion" as const })),
  ];

  if (allItems.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Attention Center</h2>
      </div>

      <div className="space-y-3">
        {allItems.map((item, idx) => (
          <AttentionRow 
            key={`${item.priority}-${idx}`}
            item={item}
            delay={0.1 + (idx * 0.1)}
          />
        ))}
      </div>
    </div>
  );
}

function AttentionRow({ 
  item, delay 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  delay: number;
}) {
  const isUrgent = item.priority === "urgent";
  const isUpcoming = item.priority === "upcoming";

  const Icon = isUrgent ? AlertCircle : (isUpcoming ? Clock : Lightbulb);
  const iconColorClass = isUrgent ? "text-terracotta" : (isUpcoming ? "text-amber-500" : "text-blue-500");
  const bgHoverClass = isUrgent ? "hover:bg-terracotta/5 border-terracotta/10" : "hover:bg-secondary/40 border-border/50";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Link href={item.actionRoute}>
        <div className={cn(
          "group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border bg-card/40 backdrop-blur-sm transition-all duration-300 gap-6 cursor-pointer",
          bgHoverClass,
          isUrgent ? "shadow-[0_4px_20px_-10px_rgba(226,90,72,0.1)] hover:shadow-[0_8px_30px_-12px_rgba(226,90,72,0.2)]" : "hover:shadow-sm"
        )}>
          <div className="flex items-start md:items-center gap-5">
            <div className={cn("p-3 rounded-2xl bg-background border border-border/50 shadow-sm", iconColorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 md:gap-8 border-t border-border/40 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
            {isUrgent && (
              <span className="text-[10px] font-bold tracking-widest uppercase text-terracotta flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" /> Urgent
              </span>
            )}
            <div className="flex items-center gap-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {item.actionLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
