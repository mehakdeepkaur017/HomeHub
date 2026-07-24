import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageLoading({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-8 max-w-5xl mx-auto w-full", className)}
    >
      <div className="space-y-3">
        <div className="h-8 w-48 bg-secondary/60 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-secondary/40 rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-secondary/20 border border-border/30 animate-pulse" />
        ))}
      </div>
      
      <div className="h-64 rounded-3xl bg-secondary/10 border border-border/20 animate-pulse mt-8" />
    </motion.div>
  );
}
