"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Download, MoreVertical, MapPin, PackageOpen, ExternalLink, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DocumentCard({ document }: { document: any }) {
  const [isHovered, setIsHovered] = useState(false);

  // Expiry Logic
  let expiryStatus = "Healthy";
  let expiryColor = "bg-forest/10 text-forest border-forest/20";
  
  if (document.expiryDate) {
    const expiry = new Date(document.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      expiryStatus = "Expired";
      expiryColor = "bg-terracotta/10 text-terracotta border-terracotta/20";
    } else if (diffDays <= 30) {
      expiryStatus = "Expires Soon";
      expiryColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  }

  // Determine icon based on mimeType
  const isImage = document.mimeType?.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-background border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/vault/${document.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {document.title}</span>
      </Link>

      {/* Top Badges & Actions */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border", 
          document.expiryDate ? expiryColor : "bg-background/80 text-muted-foreground border-border/50")}>
          {document.expiryDate ? expiryStatus : document.category}
        </div>
        
        {/* Quick Actions on Hover */}
        <div className={cn("flex gap-1 transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0 sm:opacity-0 opacity-100")}>
          <button className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative z-20">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative z-20">
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="h-32 sm:h-40 bg-secondary/30 flex items-center justify-center relative border-b border-border/40 overflow-hidden">
         {isImage && document.file ? (
            
           <img src={document.file} alt={document.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-primary/5 via-background to-secondary/20 group-hover:scale-105 transition-transform duration-700">
             {isPdf ? <FileText className="h-10 w-10 text-primary/40 stroke-[1]" /> : <File className="h-10 w-10 text-muted-foreground/30 stroke-[1]" />}
           </div>
         )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif font-medium leading-tight text-foreground truncate group-hover:text-primary transition-colors">
          {document.title}
        </h3>
        
        <div className="mt-3 flex flex-col gap-1.5 flex-1 justify-end">
           {document.asset && (
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
               <PackageOpen className="h-3 w-3 shrink-0" />
               <span className="truncate">{document.asset.name}</span>
             </div>
           )}
           {document.space && !document.asset && (
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
               <MapPin className="h-3 w-3 shrink-0" />
               <span className="truncate">{document.space.name}</span>
             </div>
           )}
           {!document.asset && !document.space && (
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate opacity-50">
               <span className="truncate">General Document</span>
             </div>
           )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
           <div className="flex items-center gap-2">
             {document.uploadedBy?.avatar ? (
                
               <img src={document.uploadedBy.avatar} alt="Uploader" className="h-5 w-5 rounded-full" />
             ) : (
               <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                 {document.uploadedBy?.name?.charAt(0) || "U"}
               </div>
             )}
             <span className="text-[10px] text-muted-foreground font-medium">
               {new Date(document.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
             </span>
           </div>
           
           <div className="text-[9px] font-bold tracking-widest uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
              Open <ExternalLink className="h-2.5 w-2.5" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
