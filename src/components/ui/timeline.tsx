import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  time: string;
  isLast?: boolean;
  children?: ReactNode;
}

export function TimelineItem({ icon: Icon, title, description, time, isLast, children }: TimelineItemProps) {
  return (
    <div className="relative pl-8 py-4 group">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-10 bottom-0 w-[2px] bg-border/40 group-hover:bg-primary/20 transition-colors" />
      )}
      
      {/* Node / Icon */}
      <div className="absolute left-0 top-5 h-6 w-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
        {Icon ? (
          <Icon className="h-3 w-3 text-muted-foreground" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{time}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
    </div>
  );
}
