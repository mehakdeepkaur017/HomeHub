"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PackageOpen, MapPin, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AssetCard({ asset }: { asset: any }) {
  const healthColor = asset.condition === "NEW" || asset.condition === "EXCELLENT" 
    ? "bg-forest/10 text-forest" 
    : asset.condition === "GOOD" 
    ? "bg-amber-500/10 text-amber-600" 
    : "bg-terracotta/10 text-terracotta";

  // Real data for activity
  const activityCount = asset._count?.activities || 0;
  const hasActivity = activityCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-row sm:flex-col items-stretch sm:h-auto h-32"
    >
      <Link href={`/assets/${asset.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {asset.name}</span>
      </Link>

      {/* Asset Cover */}
      <div className="relative w-32 sm:w-full sm:aspect-[4/3] bg-secondary/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {asset.coverImage ? (
           
          <img
            src={asset.coverImage}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/20 flex flex-col items-center justify-center text-muted-foreground/30 group-hover:scale-110 transition-transform duration-700 ease-out">
            <PackageOpen className="h-8 w-8 sm:h-12 sm:w-12 stroke-[1]" />
          </div>
        )}
        
        {/* Top Badges (Only on Desktop) */}
        <div className="hidden sm:flex absolute top-4 left-4 right-4 justify-between items-start z-20">
          <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/10", healthColor)}>
            {asset.condition}
          </div>
        </div>
      </div>

      {/* Asset Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase truncate">
              {asset.category}
            </span>
            {/* Mobile Badge */}
            <div className={cn("sm:hidden px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest", healthColor)}>
              {asset.condition}
            </div>
          </div>
          
          <h3 className="font-serif text-base sm:text-lg font-medium leading-tight text-foreground truncate group-hover:text-primary transition-colors">
            {asset.name}
          </h3>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground mt-auto">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate group-hover:text-primary/70 transition-colors">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{asset.space?.name || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Activity className="h-3 w-3 shrink-0" />
              <span className="truncate">{hasActivity ? `${activityCount} Event${activityCount > 1 ? 's' : ''}` : "No Activity"}</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ml-2">
            <span className="text-primary font-semibold text-[10px] uppercase tracking-wider">Open</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
