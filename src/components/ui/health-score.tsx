import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthScoreProps {
  score: number; // 0 to 100
  label?: string;
  className?: string;
}

export function HealthScore({ score, label = "Home Health", className }: HealthScoreProps) {
  // Determine color based on score
  const getColor = () => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    return "text-rose-500";
  };

  const colorClass = getColor();
  const circumference = 2 * Math.PI * 38; // r=38
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative h-32 w-32 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            className="text-secondary"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="38"
            cx="50"
            cy="50"
          />
          {/* Progress Ring */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={colorClass}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="38"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-4xl font-semibold tracking-tighter text-foreground">{score}</span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
