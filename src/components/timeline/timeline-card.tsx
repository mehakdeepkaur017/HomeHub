import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Box, Wrench, Banknote, FileText, Link as LinkIcon, Package } from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TimelineCard({ activity, isLast }: { activity: any; isLast?: boolean }) {


  const getBadgeColor = () => {
    if (activity.type.startsWith("SPACE_")) return "bg-blue-500/10 text-blue-600";
    if (activity.type.startsWith("ASSET_")) return "bg-indigo-500/10 text-indigo-600";
    if (activity.type.startsWith("DOCUMENT_")) return "bg-emerald-500/10 text-emerald-600";
    if (activity.type.startsWith("MAINTENANCE_")) return "bg-amber-500/10 text-amber-600";
    if (activity.type.startsWith("EXPENSE_")) return "bg-rose-500/10 text-rose-600";
    if (activity.type.startsWith("MEMBER_") || activity.type.startsWith("INVITATION_")) return "bg-purple-500/10 text-purple-600";
    return "bg-secondary text-muted-foreground";
  };

  const getModuleLabel = () => {
    if (activity.type.startsWith("SPACE_")) return "Spaces";
    if (activity.type.startsWith("ASSET_")) return "Assets";
    if (activity.type.startsWith("DOCUMENT_")) return "Vault";
    if (activity.type.startsWith("MAINTENANCE_")) return "Care";
    if (activity.type.startsWith("EXPENSE_")) return "Money";
    if (activity.type.startsWith("MEMBER_") || activity.type.startsWith("INVITATION_")) return "Family";
    return "General";
  };

  const getTargetLink = () => {
    if (!activity.targetId) return null;
    if (activity.type.startsWith("SPACE_")) return `/spaces/${activity.targetId}`;
    if (activity.type.startsWith("ASSET_")) return `/assets/${activity.targetId}`;
    if (activity.type.startsWith("DOCUMENT_")) return `/vault`; // Documents don't always have standalone pages
    if (activity.type.startsWith("MAINTENANCE_")) return `/care/${activity.targetId}`;
    if (activity.type.startsWith("EXPENSE_")) return `/money/${activity.targetId}`;
    if (activity.type.startsWith("MEMBER_") || activity.type.startsWith("INVITATION_")) return `/family`;
    return null;
  };

  const targetLink = getTargetLink();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative pl-8 sm:pl-16 py-4 group"
    >
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-4 sm:left-8 top-10 bottom-[-1rem] w-px bg-border/40 group-hover:bg-primary/20 transition-colors" />
      )}

      {/* Primary Icon Node */}
      <div className={cn(
        "absolute left-2 sm:left-6 top-5 h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center transform -translate-x-1/2",
        "bg-background border-2 border-border group-hover:border-primary/50 group-hover:scale-110 transition-all z-10"
      )}>
         <div className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        
        {/* Avatar Area */}
        <div className="hidden sm:block shrink-0 mt-1">
          <div className="h-10 w-10 rounded-full bg-secondary/50 border border-border overflow-hidden flex items-center justify-center">
            {activity.user?.avatar ? (
               
              <img src={activity.user.avatar} alt={activity.user.name || "User"} className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-sm text-muted-foreground">{activity.user?.name?.charAt(0) || "SYS"}</span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-background border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300">
          <div className="flex flex-wrap items-center gap-2 mb-3">
             <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase", getBadgeColor())}>
               {getModuleLabel()}
             </span>
             <span className="text-xs text-muted-foreground font-medium">
               {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
             </span>
          </div>

          <p className="text-lg sm:text-xl font-serif leading-tight mb-2 text-foreground/90">
            {activity.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/30 text-sm">
             <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-secondary/80 overflow-hidden flex items-center justify-center sm:hidden">
                  {activity.user?.avatar ? (
                     
                    <img src={activity.user.avatar} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-serif text-[10px]">{activity.user?.name?.charAt(0) || "S"}</span>
                  )}
                </div>
                <span className="font-medium">{activity.user?.name || "System"}</span>
             </div>

             {activity.space && (
               <>
                 <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                 <Link href={`/spaces/${activity.space.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Box className="h-3.5 w-3.5" />
                    <span className="font-medium">{activity.space.name}</span>
                 </Link>
               </>
             )}
             
             {activity.asset && (
               <>
                 <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                 <Link href={`/assets/${activity.asset.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Package className="h-3.5 w-3.5" />
                    <span className="font-medium">{activity.asset.name}</span>
                 </Link>
               </>
             )}

             {activity.document && (
               <>
                 <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                 <Link href={`/vault/${activity.document.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-medium">{activity.document.title}</span>
                 </Link>
               </>
             )}

             {activity.maintenance && (
               <>
                 <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                 <Link href={`/care/${activity.maintenance.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Wrench className="h-3.5 w-3.5" />
                    <span className="font-medium">{activity.maintenance.title}</span>
                 </Link>
               </>
             )}

             {activity.expense && (
               <>
                 <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                 <Link href={`/money/${activity.expense.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Banknote className="h-3.5 w-3.5" />
                    <span className="font-medium">{activity.expense.title}</span>
                 </Link>
               </>
             )}

             {targetLink && (
               <>
                 <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                 <Link href={targetLink} className="hidden sm:flex items-center gap-1.5 text-primary hover:underline font-medium ml-auto sm:ml-0">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>View Record</span>
                 </Link>
               </>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
