"use client";

import React from "react";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Document, Space, Asset, Home, Activity as ActivityType, User } from "@/lib/generated/prisma/client";
import { ArrowLeft, Download, ExternalLink, FileText, MapPin, PackageOpen, MoreVertical, ShieldAlert, Tag, CheckCircle2, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

import { useRecentStore } from "@/store/recent-store";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DocumentDetailClient({ document, activities, relationshipsPanel }: { document: any; activities: any[]; relationshipsPanel?: React.ReactNode }) {
  const addRecent = useRecentStore((state) => state.addRecent);

  useEffect(() => {
    addRecent({
      id: document.id,
      title: document.title,
      type: "document",
      url: `/vault/${document.id}`
    });
  }, [document.id, document.title, addRecent]);

  // Expiry Logic
  let expiryStatus = "Healthy";
  let expiryColor = "text-forest";
  let expiryBg = "bg-forest/10 border-forest/20";
  let ExpiryIcon = CheckCircle2;
  
  if (document.expiryDate) {
    const expiry = new Date(document.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      expiryStatus = "Expired";
      expiryColor = "text-terracotta";
      expiryBg = "bg-terracotta/10 border-terracotta/20";
      ExpiryIcon = ShieldAlert;
    } else if (diffDays <= 30) {
      expiryStatus = "Expires Soon";
      expiryColor = "text-amber-500";
      expiryBg = "bg-amber-500/10 border-amber-500/20";
      ExpiryIcon = ShieldAlert;
    }
  }

  const isImage = document.mimeType?.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";

  // Compute file size string
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vault" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/vault" className="hover:text-foreground transition-colors">Vault</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{document.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Link href={`/home/memory?targetId=${document.id}&targetType=DOCUMENT`}>
             <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl shadow-sm text-muted-foreground hover:text-foreground font-bold tracking-widest uppercase text-[10px]">
               History
             </Button>
           </Link>
           <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl shadow-sm"><Download className="h-4 w-4 mr-2" /> Download</Button>
           <Button aria-label="More options" variant="outline" size="icon" className="rounded-xl shadow-sm h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Preview & Timeline */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* File Preview */}
          <div className="bg-secondary/30 rounded-[2.5rem] border border-border/50 overflow-hidden flex flex-col relative shadow-sm h-[600px]">
            <div className="p-4 border-b border-border/40 bg-card/50 backdrop-blur-md flex justify-between items-center z-10">
               <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/50 shadow-sm">
                   {isPdf ? <FileText className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                 </div>
                 <span className="text-sm font-medium">{document.title}</span>
               </div>
               <Button aria-label="Open externally" variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8 bg-black/5 relative">
               {isImage && document.file ? (
                  
                 <img src={document.file} alt={document.title} className="max-w-full max-h-full object-contain rounded-lg shadow-xl" />
               ) : (
                 <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                    {isPdf ? <FileText className="h-24 w-24 mb-6 opacity-20" /> : <FileText className="h-24 w-24 mb-6 opacity-20" />}
                    <p className="font-medium text-lg">Preview not available</p>
                    <p className="text-sm">Download to view the full {document.mimeType.split('/')[1]?.toUpperCase() || "file"}.</p>
                    <Button variant="secondary" className="mt-6 rounded-xl"><Download className="h-4 w-4 mr-2" /> Download File</Button>
                 </div>
               )}
            </div>
          </div>

          {/* Activity Timeline */}
          <section className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-8">
               <History className="h-5 w-5 text-muted-foreground" />
               <h3 className="text-sm font-bold tracking-widest uppercase">Document History</h3>
             </div>
             
             {activities && activities.length > 0 ? (
                <Timeline>
                  {activities.map((act, i) => (
                    <TimelineItem 
                      key={act.id}
                      icon={FileText}
                      title={act.type.replace(/_/g, ' ')}
                      description={act.description}
                      time={new Date(act.createdAt).toLocaleDateString()}
                      isLast={i === activities.length - 1}
                    />
                  ))}
                </Timeline>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm font-medium">No history recorded yet.</p>
                </div>
              )}
          </section>

        </div>

        {/* Right Column: Metadata & Connections */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Metadata Card */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
             <div className="flex items-center justify-between border-b border-border/40 pb-6">
               <h2 className="text-2xl font-serif text-primary">{document.title}</h2>
               <div className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  {document.category}
               </div>
             </div>
             
             {document.description && (
               <p className="text-sm text-muted-foreground leading-relaxed">{document.description}</p>
             )}

             <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Uploaded By</p>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {document.uploadedBy?.avatar ? (
                       
                      <img src={document.uploadedBy.avatar} alt="Uploader" className="h-5 w-5 rounded-full" />
                    ) : (
                      <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {document.uploadedBy?.name?.charAt(0) || "U"}
                      </span>
                    )}
                    {document.uploadedBy?.name || "System"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Date Added</p>
                  <p className="font-medium text-sm">{new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Format</p>
                  <p className="font-medium text-sm uppercase">{document.mimeType.split('/')[1] || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Size</p>
                  <p className="font-medium text-sm">{formatBytes(document.size)}</p>
                </div>
                
                {document.tags && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.split(',').map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-secondary rounded-md text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3 w-3" /> {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Expiry Engine */}
          {document.expiryDate && (
             <div className={cn("rounded-3xl border p-6 shadow-sm flex items-center gap-4", expiryBg)}>
               <div className={cn("h-12 w-12 rounded-full flex items-center justify-center bg-background shadow-sm", expiryColor)}>
                 <ExpiryIcon className="h-6 w-6" />
               </div>
               <div>
                 <p className={cn("text-[10px] font-bold tracking-widest uppercase", expiryColor)}>{expiryStatus}</p>
                 <p className="text-sm font-medium text-foreground mt-0.5">Expires on {new Date(document.expiryDate).toLocaleDateString()}</p>
               </div>
             </div>
          )}

          {/* WOW Feature: Visual Relationship Map */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
             <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-8">Connection Map</h3>
             
             <div className="relative pl-6">
                {/* Connecting animated line */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-border origin-top z-0"
                />

                <div className="flex flex-col gap-8 relative z-10">
                  
                  {/* The Document */}
                  <div className="flex items-center gap-4 group">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }} className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-[3px] border-background shadow-sm -ml-6">
                      <FileText className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-0.5">This Document</p>
                      <p className="text-sm font-medium truncate">{document.title}</p>
                    </div>
                  </div>

                  {/* Connected Asset */}
                  {document.asset && (
                    <div className="flex items-center gap-4 group">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm -ml-5">
                        <PackageOpen className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-0.5">Asset</p>
                        <p className="text-sm font-medium truncate">{document.asset.name}</p>
                      </div>
                      <Link href={`/assets/${document.asset.id}`} className="text-[10px] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">View</Link>
                    </div>
                  )}

                  {/* Connected Space */}
                  {document.space && (
                    <div className="flex items-center gap-4 group">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm -ml-5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-0.5">Space</p>
                        <p className="text-sm font-medium truncate">{document.space.name}</p>
                      </div>
                      <Link href={`/spaces/${document.space.id}`} className="text-[10px] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">View</Link>
                    </div>
                  )}

                  {/* Connected Home */}
                  <div className="flex items-center gap-4 group">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, type: "spring" }} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm -ml-5">
                      <span className="text-lg">🏡</span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-0.5">Home</p>
                      <p className="text-sm font-medium truncate">{document.home.name}</p>
                    </div>
                  </div>

                 </div>
              </div>
           </div>
           
           {relationshipsPanel}

        </div>
      </div>
    </div>
  );
}
