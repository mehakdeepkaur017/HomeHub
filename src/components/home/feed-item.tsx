"use client";

import { motion } from "framer-motion";
import { Activity, User, PackageOpen, Box, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HomeFeedItem({ item, index }: { item: any; index: number }) {
  // Determine icon based on type
  const isAsset = item.type.includes("ASSET");
  const isSpace = item.type.includes("SPACE");
  
  const Icon = isAsset ? PackageOpen : isSpace ? Box : Activity;
  const colorClass = isAsset ? "bg-amber-500/10 text-amber-600" : isSpace ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary";

  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative flex gap-4 p-4 rounded-2xl hover:bg-secondary/40 transition-colors"
    >
      <div className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 text-sm">
            {item.user?.avatar ? (
               
              <img src={item.user.avatar} alt={item.user.name || "User"} className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="font-medium text-foreground truncate">{item.user?.name || "System"}</span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
        </div>
        
        <p className="text-sm text-muted-foreground leading-snug">
          {item.description}
        </p>
        
        {item.targetId && (
          <Link 
            href={isAsset ? `/assets/${item.targetId}` : isSpace ? `/spaces` : "#"}
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View Details <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
