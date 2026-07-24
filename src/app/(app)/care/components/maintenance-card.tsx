"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wrench, Calendar, MapPin, PackageOpen, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MaintenanceCard({ maintenance }: { maintenance: any }) {
  const isCompleted = maintenance.status === "COMPLETED";
  const isOverdue = maintenance.status === "SCHEDULED" && new Date(maintenance.scheduledDate) < new Date();
  
  let statusColor = "text-muted-foreground";
  let statusBg = "bg-secondary";
  let StatusIcon = Calendar;
  
  if (isCompleted) {
    statusColor = "text-forest";
    statusBg = "bg-forest/10 border-forest/20";
    StatusIcon = CheckCircle2;
  } else if (isOverdue) {
    statusColor = "text-terracotta";
    statusBg = "bg-terracotta/10 border-terracotta/20";
    StatusIcon = AlertTriangle;
  } else if (maintenance.status === "SCHEDULED") {
    statusColor = "text-primary";
    statusBg = "bg-primary/10 border-primary/20";
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="group relative bg-background border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
    >
      <Link href={`/care/${maintenance.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {maintenance.title}</span>
      </Link>
      
      <div className="p-4 sm:p-5 flex items-start gap-4 sm:gap-5">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border", statusBg, statusColor)}>
          <StatusIcon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
              {maintenance.category}
            </span>
            {maintenance.priority === "HIGH" || maintenance.priority === "CRITICAL" ? (
              <span className="text-[9px] font-bold tracking-widest uppercase text-terracotta flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {maintenance.priority}
              </span>
            ) : null}
          </div>
          
          <h3 className="font-serif font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {maintenance.title}
          </h3>
          
          <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1.5">
               <Calendar className="h-3.5 w-3.5 shrink-0" />
               {isCompleted ? (
                 <span>Completed on {new Date(maintenance.completedDate!).toLocaleDateString()}</span>
               ) : (
                 <span className={cn(isOverdue && "text-terracotta font-medium")}>
                   Due {new Date(maintenance.scheduledDate).toLocaleDateString()}
                 </span>
               )}
             </div>
             
             {maintenance.asset && (
               <div className="flex items-center gap-1.5">
                 <PackageOpen className="h-3.5 w-3.5 shrink-0" />
                 <span className="truncate max-w-[120px]">{maintenance.asset.name}</span>
               </div>
             )}
             
             {!maintenance.asset && maintenance.space && (
               <div className="flex items-center gap-1.5">
                 <MapPin className="h-3.5 w-3.5 shrink-0" />
                 <span className="truncate max-w-[120px]">{maintenance.space.name}</span>
               </div>
             )}
             
             {!maintenance.asset && !maintenance.space && (
               <div className="flex items-center gap-1.5">
                 <Wrench className="h-3.5 w-3.5 shrink-0" />
                 <span className="truncate">General Home</span>
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
