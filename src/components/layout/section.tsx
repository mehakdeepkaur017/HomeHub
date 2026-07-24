import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Premium Content Section
 * Establishes vertical rhythm and bento grid layout conventions.
 */
export function Section({ title, description, action, children, className, containerClassName }: SectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground/80">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      
      <div className={cn("", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
