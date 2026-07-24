import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, ArrowRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TimelineMilestone({ activity, isLast }: { activity: any; isLast?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative pl-8 sm:pl-16 py-8 sm:py-12 group"
    >
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-4 sm:left-8 top-16 bottom-[-2rem] w-px bg-border/40" />
      )}

      {/* Primary Icon Node */}
      <div className={cn(
        "absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-6 sm:w-6 rounded-full flex items-center justify-center transform -translate-x-1/2",
        "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] z-10"
      )}>
         <Sparkles className="h-2 w-2 sm:h-3 sm:w-3" />
      </div>

      <div className="bg-gradient-to-br from-primary/[0.08] to-transparent border border-primary/20 rounded-[2.5rem] p-8 sm:p-12 text-center relative overflow-hidden">
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Sparkles className="h-32 w-32 text-primary" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
           <span className="px-3 py-1 bg-primary/10 text-primary font-bold tracking-widest uppercase text-[10px] rounded-full mb-6">
             Home Milestone
           </span>
           
           <h3 className="text-3xl sm:text-5xl font-serif text-foreground/90 mb-6 leading-tight">
             {activity.milestoneTitle}
           </h3>
           
           <p className="text-lg text-muted-foreground mb-8">
             {activity.description} on {format(new Date(activity.createdAt), "MMMM do, yyyy")}.
           </p>

           <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                   {activity.user?.avatar ? (
                      
                     <img src={activity.user.avatar} alt="User" className="h-full w-full object-cover" />
                   ) : (
                     <span className="font-serif text-[10px]">{activity.user?.name?.charAt(0) || "S"}</span>
                   )}
                 </div>
                 <span>{activity.user?.name || "System"}</span>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
