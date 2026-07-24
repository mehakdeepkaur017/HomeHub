/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Space, Asset, Activity } from "@/lib/generated/prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, FileText, Wrench, 
  Camera, StickyNote, Upload
} from "lucide-react";
import { Section } from "@/components/layout/section";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useRecentStore } from "@/store/recent-store";
import { AssetCard } from "@/app/(app)/assets/components/asset-card";


type SpaceWithRelations = Space & {
  assets: Asset[];
  activities: Activity[];
   
  documents?: any[];
   
  maintenance?: any[];
   
  expenses?: any[];
   
  createdBy?: any;
};

interface SpaceDetailClientProps {
  space: SpaceWithRelations;
  relationshipsPanel?: React.ReactNode;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "assets", label: "Assets" },
  { id: "documents", label: "Documents" },
  { id: "care", label: "Care & Maintenance" },
  { id: "photos", label: "Photos" },
  { id: "notes", label: "Notes" },
];

export function SpaceDetailClient({ space, relationshipsPanel }: SpaceDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<any>("overview");
  const addRecent = useRecentStore((state) => state.addRecent);

  useEffect(() => {
    addRecent({
      id: space.id,
      title: space.name,
      type: "space",
      url: `/spaces/${space.id}`
    });
  }, [space.id, space.name, addRecent]);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPhotos, setLocalPhotos] = useState<any[]>([]);
  
  const [isWritingNote, setIsWritingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [localNotes, setLocalNotes] = useState<any[]>([]);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSavingNote(true);
    toast.loading("Saving note...", { id: "save-note" });

    try {
      const dummyFile = "data:text/plain;base64," + btoa(unescape(encodeURIComponent(noteContent)));
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-home-id': space.homeId 
        },
        body: JSON.stringify({
          title: noteTitle,
          description: noteContent,
          category: "Note",
          file: dummyFile,
          mimeType: "text/plain",
          size: dummyFile.length,
          spaceId: space.id
        })
      });

      if (res.ok) {
        const newNote = await res.json();
        setLocalNotes(prev => [newNote, ...prev]);
        toast.success("Note saved successfully", { id: "save-note" });
        setIsWritingNote(false);
        setNoteTitle("");
        setNoteContent("");
        router.refresh();
      } else {
        toast.error("Failed to save note", { id: "save-note" });
      }
    } catch (error) {
      toast.error("Network error", { id: "save-note" });
    } finally {
      setIsSavingNote(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    toast.loading("Uploading photo...", { id: "upload-photo" });
    try {
      // Compress image client-side before sending
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1200;
          const scaleSize = maxWidth / img.width;
          
          let width = img.width;
          let height = img.height;
          
          if (scaleSize < 1) {
            width = maxWidth;
            height = img.height * scaleSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          
          try {
            const res = await fetch('/api/documents', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-home-id': space.homeId 
              },
              body: JSON.stringify({
                title: file.name,
                category: "Photo",
                file: base64,
                mimeType: 'image/jpeg',
                size: Math.round(base64.length * 0.75), // approximate bytes from base64
                spaceId: space.id
              })
            });
            if (res.ok) {
              const newPhoto = await res.json();
              setLocalPhotos(prev => [newPhoto, ...prev]);
              toast.success("Photo uploaded successfully", { id: "upload-photo" });
              setActiveTab("photos");
              router.refresh();
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || "Failed to upload photo", { id: "upload-photo" });
            }
          } catch (fetchErr) {
            toast.error("Network error during upload", { id: "upload-photo" });
          } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        };
        img.onerror = () => {
          toast.error("Invalid image file", { id: "upload-photo" });
          setIsUploadingPhoto(false);
        };
      };
    } catch (error) {
      toast.error("An error occurred reading the file", { id: "upload-photo" });
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const expenses = space.expenses || [];
   
  const totalInvestment = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
  const allDocs = space.documents || [];
  const documents = allDocs.filter((d: any) => d.category !== "Photo" && d.category !== "Note");
  
  // Combine server photos with optimistic local photos (avoiding duplicates)
  const serverPhotos = allDocs.filter((d: any) => d.category === "Photo");
  const photos = [...localPhotos, ...serverPhotos].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
  
  // Combine server notes with optimistic local notes
  const serverNotes = allDocs.filter((d: any) => d.category === "Note");
  const notes = [...localNotes, ...serverNotes].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
  
  const maintenance = space.maintenance || [];

  // Calculate Real Health Data based on actual relations
  const hasAssets = space.assets.length > 0;
  
  const assetScore = Math.min(space.assets.length * 15, 60);
  const activityScore = Math.min(space.activities.length * 5, 40);
  const healthScore = hasAssets ? assetScore + activityScore : 0;

  // Space Personality Calculations
  const assetCount = space.assets.length;
  const maintenanceCount = maintenance.length;
  
  let personalityTitle = "Quiet Space";
  let personalityDesc = "A peaceful room with little tracked activity.";
  
  if (assetCount > 10) {
    personalityTitle = "Collector's Haven";
    personalityDesc = "This space holds a significant portion of your tracked items.";
  } else if (maintenanceCount > 5) {
    personalityTitle = "High Maintenance";
    personalityDesc = "This space requires frequent care and attention.";
  } else if (totalInvestment > 5000) {
    personalityTitle = "High Value Area";
    personalityDesc = "A premium space with significant financial investment.";
  } else if (space.activities.length > 20) {
    personalityTitle = "Most Active Space";
    personalityDesc = "The center of activity in your home recently.";
  }

  // Connected Home Graph Data
  const centralNode: GraphNode = {
    id: space.id,
    type: "SPACE",
    name: space.name,
    subtitle: space.floor || "Unassigned Floor",
    link: `/spaces/${space.id}`
  };

  const satellites: GraphNode[] = [];
  if (space.createdBy) {
    satellites.push({
      id: space.createdBy.id,
      type: "MEMBER",
      name: space.createdBy.name || "Unknown",
      subtitle: "Creator",
      link: `/family/${space.createdBy.id}`
    });
  }
  space.assets.forEach((a: any) => satellites.push({
    id: a.id,
    type: "ASSET",
    name: a.name,
    subtitle: a.category,
    link: `/assets/${a.id}`
  }));
  documents.forEach((doc: any) => satellites.push({
    id: doc.id,
    type: "DOCUMENT",
    name: doc.title,
    link: `/vault/${doc.id}`
  }));
  maintenance.forEach((m: any) => satellites.push({
    id: m.id,
    type: "MAINTENANCE",
    name: m.title,
    link: `/care/${m.id}`
  }));
  expenses.forEach((e: any) => satellites.push({
    id: e.id,
    type: "EXPENSE",
    name: e.title,
    subtitle: `${e.currency} ${e.amount}`,
    link: `/money/${e.id}`
  }));

  return (
    <div className="space-y-10">
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} className="hidden" />

      {/* TABS NAVIGATION */}
      <div className="border-b border-border/40 pb-0 pt-4 -mx-6 px-6 lg:-mx-12 lg:px-12 relative">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide relative z-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[50vh] relative z-0">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              {/* Left Column */}
              <div className="space-y-10">
                <Section title="Recent Assets" action={<Button variant="ghost" size="sm" onClick={() => setActiveTab("assets")}>View All</Button>}>
                  {space.assets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {space.assets.slice(0, 4).map(asset => (
                        <div key={asset.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer">
                           <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                             <Package className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                             <p className="text-sm font-medium leading-none mb-1">{asset.name}</p>
                             <p className="text-xs text-muted-foreground">{asset.category || "Uncategorized"}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card variant="display" className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-none">
                       <Package className="w-8 h-8 text-muted-foreground/30 mb-3" />
                       <h4 className="text-sm font-medium mb-1">This room is ready to be organized.</h4>
                       <p className="text-xs text-muted-foreground max-w-sm mb-4">Start by adding appliances, furniture, or valuables.</p>
                       <Button size="sm" variant="secondary">Add Asset</Button>
                    </Card>
                  )}
                </Section>
                
                <Section title="Recent Activity">
                  {space.activities.length > 0 ? (
                    <div className="space-y-6 pl-2 border-l border-border/50">
                      {space.activities.slice(0, 5).map(act => (
                        <div key={act.id} className="relative">
                          <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                          <p className="text-sm font-medium leading-snug">{act.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(act.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                      No activity recorded in this space yet.
                    </div>
                  )}
                </Section>
              </div>

              {/* Right Column */}
              <div className="space-y-10">
                {relationshipsPanel}

                <Section title="Quick Actions">
                   <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => router.push('/vault/upload')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium">Upload Doc</span>
                     </button>
                     <button onClick={() => router.push('/care/create')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <Wrench className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium">Log Care</span>
                     </button>
                     <button onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 disabled:opacity-50">
                        <Camera className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium">{isUploadingPhoto ? "Uploading..." : "Add Photo"}</span>
                     </button>
                     <button onClick={() => { setActiveTab("notes"); setIsWritingNote(true); }} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <StickyNote className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium">Write Note</span>
                     </button>
                   </div>
                </Section>
                </div>
                
                {/* Expenses View */}
                {activeTab === "expenses" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Space Expenses</h3>
                       <p className="text-lg font-serif">Total: ${totalInvestment.toLocaleString()}</p>
                    </div>
                    {expenses.length > 0 ? (
                      <div className="space-y-3">
                         { }
                         {expenses.map((exp: any) => (
                           <Link href={`/money/${exp.id}`} key={exp.id}>
                             <div className="group flex items-center justify-between p-4 bg-background shadow-sm border border-border/50 rounded-2xl hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer">
                               <div>
                                 <p className="font-medium text-sm group-hover:text-primary transition-colors">{exp.title}</p>
                                 <p className="text-xs text-muted-foreground mt-0.5">{new Date(exp.expenseDate).toLocaleDateString()} • {exp.category}</p>
                               </div>
                               <p className="font-serif font-medium text-primary">${exp.amount.toLocaleString()}</p>
                             </div>
                           </Link>
                         ))}
                      </div>
                    ) : (
                      <div className="bg-card/40 border border-border/50 border-dashed rounded-3xl p-8 text-center flex flex-col items-center">
                         <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
                         <p className="text-sm font-medium text-foreground">No expenses</p>
                         <p className="text-xs text-muted-foreground max-w-[200px] mt-1 mb-4">Record expenses tied to this space to build its financial history.</p>
                         <Link href="/money/create">
                           <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg">Log Expense</Button>
                         </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div
              key="documents-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-serif text-primary">Connected Documents</h3>
                   <p className="text-sm text-muted-foreground mt-1">Files assigned specifically to {space.name}.</p>
                 </div>
                 <Link href="/vault/upload">
                   <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Upload to Vault</Button>
                 </Link>
               </div>
               {documents.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   { }
                   {documents.map((doc: any) => (
                     <Link href={`/vault/${doc.id}`} key={doc.id}>
                       <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.category}</p>
                          </div>
                       </div>
                     </Link>
                   ))}
                 </div>
               ) : (
                 <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                     <FileText className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-serif mb-2">No documents attached</h3>
                   <p className="text-sm text-muted-foreground max-w-sm mb-6">
                     Upload floor plans, room measurements, or warranties related to this specific space.
                   </p>
                   <Link href="/vault/upload">
                     <Button variant="outline">Upload Document</Button>
                   </Link>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === "care" && (
            <motion.div
              key="care-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-serif text-primary">Care & Maintenance</h3>
                   <p className="text-sm text-muted-foreground mt-1">Maintenance assigned specifically to {space.name}.</p>
                 </div>
                 <Link href="/care/create">
                   <Button variant="outline"><Wrench className="h-4 w-4 mr-2" /> Schedule Care</Button>
                 </Link>
               </div>
               
               {maintenance.length > 0 ? (
                 <div className="space-y-4">
                   { }
                   {maintenance.map((m: any) => {
                     const isCompleted = m.status === "COMPLETED";
                     const isOverdue = m.status === "SCHEDULED" && new Date(m.scheduledDate) < new Date();
                     
                     return (
                       <Link href={`/care/${m.id}`} key={m.id}>
                         <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105", 
                               isCompleted ? "bg-forest/10 text-forest border-forest/20" : 
                               isOverdue ? "bg-terracotta/10 text-terracotta border-terracotta/20" : 
                               "bg-primary/10 text-primary border-primary/20"
                            )}>
                              <Wrench className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{m.title}</p>
                              <p className={cn("text-xs", isOverdue ? "text-terracotta" : "text-muted-foreground")}>
                                {isCompleted ? `Completed ${new Date(m.completedDate).toLocaleDateString()}` : `Due ${new Date(m.scheduledDate).toLocaleDateString()}`}
                              </p>
                            </div>
                         </div>
                       </Link>
                     );
                   })}
                 </div>
               ) : (
                 <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                     <Wrench className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-serif mb-2">No maintenance scheduled</h3>
                   <p className="text-sm text-muted-foreground max-w-sm mb-6">
                     Schedule cleaning, inspections, and repairs for this space.
                   </p>
                   <Link href="/care/create">
                     <Button variant="outline">Schedule Care</Button>
                   </Link>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === "photos" && (
            <motion.div
              key="photos-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-serif text-primary">Space Photos</h3>
                   <p className="text-sm text-muted-foreground mt-1">Visual documentation for {space.name}.</p>
                 </div>
                 <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
                    <Camera className="h-4 w-4 mr-2" /> 
                    {isUploadingPhoto ? "Uploading..." : "Add Photo"}
                 </Button>
               </div>
               
               {photos.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {photos.map((photo: any) => (
                     <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-border/50">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={photo.file} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                         <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                         <p className="text-white/70 text-xs">{new Date(photo.createdAt).toLocaleDateString()}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                     <Camera className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-serif mb-2">No photos yet</h3>
                   <p className="text-sm text-muted-foreground max-w-sm mb-6">
                     Upload photos of the room, receipts, or important visual details.
                   </p>
                   <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
                     {isUploadingPhoto ? "Uploading..." : "Add Photo"}
                   </Button>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div
              key="notes-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-serif text-primary">Space Notes</h3>
                   <p className="text-sm text-muted-foreground mt-1">Keep track of measurements, ideas, or to-dos.</p>
                 </div>
                 {!isWritingNote && (
                   <Button variant="outline" onClick={() => setIsWritingNote(true)}>
                      <StickyNote className="h-4 w-4 mr-2" /> 
                      Write Note
                   </Button>
                 )}
               </div>
               
               {isWritingNote ? (
                 <div className="bg-background border border-border/50 rounded-3xl p-6 shadow-sm">
                   <input
                     type="text"
                     placeholder="Note Title"
                     value={noteTitle}
                     onChange={(e) => setNoteTitle(e.target.value)}
                     className="w-full text-lg font-serif mb-4 p-2 bg-transparent border-b border-border/50 focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                   />
                   <textarea
                     placeholder="Write your note here..."
                     value={noteContent}
                     onChange={(e) => setNoteContent(e.target.value)}
                     className="w-full h-40 p-2 bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
                   />
                   <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/30">
                     <Button variant="ghost" onClick={() => { setIsWritingNote(false); setNoteTitle(""); setNoteContent(""); }} disabled={isSavingNote}>
                       Cancel
                     </Button>
                     <Button onClick={handleSaveNote} disabled={isSavingNote || !noteTitle.trim() || !noteContent.trim()}>
                       {isSavingNote ? "Saving..." : "Save Note"}
                     </Button>
                   </div>
                 </div>
               ) : notes.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {notes.map((note: any) => (
                     <div key={note.id} className="p-6 rounded-2xl border border-border/50 bg-background shadow-sm hover:shadow-md transition-all">
                       <h4 className="font-serif text-lg mb-2">{note.title}</h4>
                       <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap line-clamp-4">{note.description}</p>
                       <p className="text-xs text-muted-foreground/60">{new Date(note.createdAt).toLocaleDateString()}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                     <StickyNote className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-serif mb-2">No notes yet</h3>
                   <p className="text-sm text-muted-foreground max-w-sm mb-6">
                     Jot down paint colors, furniture measurements, or renovation ideas.
                   </p>
                   <Button variant="outline" onClick={() => setIsWritingNote(true)}>
                     Write Note
                   </Button>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === "assets" && (
            <motion.div
              key="assets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-serif text-primary">Space Assets</h3>
                   <p className="text-sm text-muted-foreground mt-1">Appliances, furniture, and valuables in this space.</p>
                 </div>
                 <Link href={`/assets/create?spaceId=${space.id}`}>
                   <Button variant="outline">
                      <Package className="h-4 w-4 mr-2" /> 
                      Add Asset
                   </Button>
                 </Link>
               </div>
               
               {space.assets.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {space.assets.map((asset: any) => (
                     <AssetCard key={asset.id} asset={asset} />
                   ))}
                 </div>
               ) : (
                 <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                     <Package className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-serif mb-2">No assets yet</h3>
                   <p className="text-sm text-muted-foreground max-w-sm mb-6">
                     Start tracking the important items in this room.
                   </p>
                   <Link href={`/assets/create?spaceId=${space.id}`}>
                     <Button variant="outline">Add Asset</Button>
                   </Link>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab !== "overview" && activeTab !== "documents" && activeTab !== "care" && activeTab !== "photos" && activeTab !== "notes" && activeTab !== "assets" && (
            <motion.div
              key="other-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
            >
               <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                 <Camera className="w-6 h-6 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-serif mb-2">Feature in Development</h3>
               <p className="text-sm text-muted-foreground max-w-sm">
                 This section is coming in a future update.
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
