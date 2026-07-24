/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Asset, Space, Activity as ActivityType, User } from "@/lib/generated/prisma/client";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Edit, MoreVertical, PackageOpen, FileText, Wrench, Activity, Tag, Share2, Info, FileStack, Banknote } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useHome } from "@/components/providers/home-provider";
import { formatCurrency } from "@/lib/utils";
import { Section } from "@/components/layout/section";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

import { useRecentStore } from "@/store/recent-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AssetWithRelations = Asset & {
  space: Space | null;
  createdBy: User | null;
   
  documents?: any[];
   
  maintenance?: any[];
   
  expenses?: any[];
};

interface AssetDetailClientProps {
  asset: AssetWithRelations;
  activities: ActivityType[];
  relationshipsPanel?: React.ReactNode;
}

export function AssetDetailClient({ asset, activities, relationshipsPanel }: AssetDetailClientProps) {
  const [activeTab, setActiveTab] = useState("passport");
  const router = useRouter();
  const { completion } = useOnboarding();
  const { activeHome } = useHome();
  const addRecent = useRecentStore((state) => state.addRecent);

  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identityForm, setIdentityForm] = useState({
    brand: asset.brand || asset.manufacturer || "",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
    purchasePrice: asset.purchasePrice || "",
  });

  const handleSaveIdentity = async () => {
    setIsSavingIdentity(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-home-id": activeHome!.id
        },
        body: JSON.stringify({
          brand: identityForm.brand || null,
          model: identityForm.model || null,
          serialNumber: identityForm.serialNumber || null,
          purchaseDate: identityForm.purchaseDate ? new Date(identityForm.purchaseDate).toISOString() : null,
          purchasePrice: identityForm.purchasePrice ? parseFloat(identityForm.purchasePrice.toString()) : null,
        }),
      });
      if (res.ok) {
        toast.success("Identity updated successfully");
        setIsEditingIdentity(false);
        router.refresh();
      } else {
        toast.error("Failed to update identity");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSavingIdentity(false);
    }
  };

  useEffect(() => {
    addRecent({
      id: asset.id,
      title: asset.name,
      type: "asset",
      url: `/assets/${asset.id}`
    });
  }, [asset.id, asset.name, addRecent]);

  const qrUrl = typeof window !== "undefined" ? `${window.location.origin}/assets/${asset.id}` : "";


  // Object Story Calculations
  const addedMonthsAgo = Math.floor((new Date().getTime() - new Date(asset.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
  const addedString = addedMonthsAgo === 0 ? "Added recently" : `Added ${addedMonthsAgo} month${addedMonthsAgo > 1 ? 's' : ''} ago`;
  const spaceString = asset.space ? `Lives in ${asset.space.name}` : "Not assigned to a space";
  const maintenanceString = asset.maintenance?.length ? `Maintained ${asset.maintenance.length} time${asset.maintenance.length > 1 ? 's' : ''}` : "Never maintained";
  const docsString = asset.documents?.length ? "Documents protected" : "No digital records";

  const healthColor = asset.condition === "NEW" || asset.condition === "EXCELLENT" 
    ? "bg-forest/10 text-forest" 
    : asset.condition === "GOOD" 
    ? "bg-amber-500/10 text-amber-600" 
    : "bg-terracotta/10 text-terracotta";

  const documents = asset.documents || [];
  const maintenance = asset.maintenance || [];
   
  const upcomingService = maintenance.find((m: any) => m.status === "SCHEDULED" && new Date(m.scheduledDate) >= new Date());
   
  const lastMaintenance = [...maintenance].reverse().find((m: any) => m.status === "COMPLETED");

  const expenses = asset.expenses || [];
  const totalPurchaseCost = asset.purchasePrice || 0;
   
  const maintenanceExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
  const totalInvestment = totalPurchaseCost + maintenanceExpenses;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/assets" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/assets" className="hover:text-foreground transition-colors">Assets</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{asset.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative">
        <div className="md:w-1/3 bg-secondary/30 flex items-center justify-center min-h-[300px] relative overflow-hidden group">
          {asset.coverImage ? (
             
            <img src={asset.coverImage} alt={asset.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-secondary flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
              <PackageOpen className="h-20 w-20 text-muted-foreground/30 stroke-[1]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  {asset.category || "Uncategorized"}
                </span>
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase", healthColor)}>
                  {asset.condition}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Link href={`/home/memory?targetId=${asset.id}&targetType=ASSET`}>
                  <Button variant="outline" size="sm" className="rounded-full h-10 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
                    History
                  </Button>
                </Link>
                <Button aria-label="Edit asset" variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button aria-label="More options" variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-primary leading-tight">{asset.name}</h1>
            <p className="text-lg text-muted-foreground mt-2 font-light flex items-center gap-2">
               {asset.space?.name || "Unassigned Space"} 
               <span className="text-muted-foreground/30">•</span>
               {asset.brand || "Unknown Brand"}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Status</p>
              <p className="font-medium text-sm">{asset.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Added By</p>
              <p className="font-medium text-sm truncate">{asset.createdBy?.name || "System"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Added Date</p>
              <p className="font-medium text-sm">{format(new Date(asset.createdAt), "dd/MM/yyyy")}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - Deep Passport */}
        <div className="lg:col-span-8 space-y-10">
          
          <div className="flex gap-4 border-b border-border/50 pb-px overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("passport")}
              className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "passport" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Digital Passport
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === "timeline" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Activity Timeline
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "passport" && (
              <motion.div
                key="passport"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <Section title="Object Story">
                  <Card variant="bento" className="p-6 md:p-8 bg-card/40">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-1 flex items-center gap-2"><PackageOpen className="w-3 h-3"/> Origin</p>
                        <p className="text-sm font-medium">{addedString}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-1 flex items-center gap-2"><Tag className="w-3 h-3"/> Location</p>
                        <p className="text-sm font-medium">{spaceString}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-1 flex items-center gap-2"><Wrench className="w-3 h-3"/> Care</p>
                        <p className="text-sm font-medium">{maintenanceString}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-1 flex items-center gap-2"><FileStack className="w-3 h-3"/> Vault</p>
                        <p className="text-sm font-medium">{docsString}</p>
                      </div>
                    </div>
                  </Card>
                </Section>

                {/* Identity & Details */}
                <Section 
                  title="Identity & Details"
                  action={
                    isEditingIdentity ? (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingIdentity(false)} disabled={isSavingIdentity} className="h-8">Cancel</Button>
                        <Button size="sm" onClick={handleSaveIdentity} disabled={isSavingIdentity} className="h-8">{isSavingIdentity ? "Saving..." : "Save"}</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingIdentity(true)} className="h-8 text-xs font-medium text-primary">Edit Details</Button>
                    )
                  }
                >
                  <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Manufacturer / Brand</p>
                       {isEditingIdentity ? (
                         <input type="text" className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" value={identityForm.brand} onChange={(e) => setIdentityForm({...identityForm, brand: e.target.value})} placeholder="Sony, Apple, etc." />
                       ) : (
                         <p className="font-medium">{asset.brand || asset.manufacturer || "Not specified"}</p>
                       )}
                     </div>
                     <div>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Model Name / Number</p>
                       {isEditingIdentity ? (
                         <input type="text" className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" value={identityForm.model} onChange={(e) => setIdentityForm({...identityForm, model: e.target.value})} placeholder="Model X" />
                       ) : (
                         <p className="font-medium">{asset.model || "Not specified"}</p>
                       )}
                     </div>
                     <div>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Serial Number</p>
                       {isEditingIdentity ? (
                         <input type="text" className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" value={identityForm.serialNumber} onChange={(e) => setIdentityForm({...identityForm, serialNumber: e.target.value})} placeholder="S/N" />
                       ) : (
                         <p className="font-mono text-sm">{asset.serialNumber || "Not specified"}</p>
                       )}
                     </div>
                     <div>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Purchase Date</p>
                       {isEditingIdentity ? (
                         <input type="date" className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" value={identityForm.purchaseDate} onChange={(e) => setIdentityForm({...identityForm, purchaseDate: e.target.value})} />
                       ) : (
                         <p className="font-medium">{asset.purchaseDate ? format(new Date(asset.purchaseDate), "dd/MM/yyyy") : "Not specified"}</p>
                       )}
                     </div>
                     <div>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Added By</p>
                       <p className="font-medium flex items-center gap-1.5">
                         { }
                         {(asset.createdBy as any)?.name || "Unknown"}
                       </p>
                     </div>
                     {isEditingIdentity && (
                       <div>
                         <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Purchase Price</p>
                         <input type="text" inputMode="decimal" className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" value={identityForm.purchasePrice} onChange={(e) => setIdentityForm({...identityForm, purchasePrice: e.target.value})} placeholder="0.00" />
                       </div>
                     )}
                     
                     {/* Dynamic Financial Overview */}
                     <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                       <div className="p-4 bg-background border border-border/50 rounded-2xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Purchase Cost</p>
                         <p className="text-xl font-serif">{formatCurrency(totalPurchaseCost, activeHome?.currency)}</p>
                       </div>
                       <div className="p-4 bg-background border border-border/50 rounded-2xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Maintenance Cost</p>
                         <p className="text-xl font-serif">{formatCurrency(maintenanceExpenses, activeHome?.currency)}</p>
                       </div>
                       <div className="p-4 bg-background border border-border/50 rounded-2xl flex flex-col justify-center bg-primary/5 border-primary/20">
                         <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-1">Total Investment</p>
                         <p className="text-xl font-serif text-primary">{formatCurrency(totalInvestment, activeHome?.currency)}</p>
                       </div>
                       <div className="p-4 bg-background border border-border/50 rounded-2xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Est. Current Value</p>
                         <p className="text-xl font-serif">{asset.estimatedCurrentValue ? formatCurrency(asset.estimatedCurrentValue, activeHome?.currency) : "—"}</p>
                       </div>
                   </div>
                  </div>
                </Section>

                {/* Vault & Documents Connection */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Vault Documents</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-primary">Upload Document</Button>
                  </div>
                  <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    {documents.length > 0 ? (
                      <div className="text-left w-full space-y-3">
                         { }
                         {documents.map((doc: any) => (
                           <Link href={`/vault/${doc.id}`} key={doc.id}>
                             <div className="flex items-center gap-4 p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.title}</p>
                                  <p className="text-xs text-muted-foreground">{doc.category}</p>
                                </div>
                             </div>
                           </Link>
                         ))}
                      </div>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                          <FileStack className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="font-medium text-sm mb-1">No documents attached yet.</p>
                        <p className="text-xs text-muted-foreground max-w-sm">Attach warranties, invoices, and manuals from the Vault to keep everything related to this object in one place.</p>
                      </>
                    )}
                  </div>
                </section>

                {/* Care & Maintenance Connection */}
                <div className="pt-10">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Care & Maintenance</h3>
                    <Link href="/care/create">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-primary">Log Service</Button>
                    </Link>
                   </div>
                   <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                      {maintenance.length > 0 ? (
                        <div className="text-left w-full space-y-3">
                           { }
                           {maintenance.map((m: any) => {
                             const isCompleted = m.status === "COMPLETED";
                             const isOverdue = m.status === "SCHEDULED" && new Date(m.scheduledDate) < new Date();
                             return (
                               <Link href={`/care/${m.id}`} key={m.id}>
                                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
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
                                        {isCompleted ? `Completed ${format(new Date(m.completedDate), "dd/MM/yyyy")}` : `Due ${format(new Date(m.scheduledDate), "dd/MM/yyyy")}`}
                                      </p>
                                    </div>
                                 </div>
                               </Link>
                             );
                           })}
                        </div>
                      ) : (
                        <>
                          <Wrench className="w-8 h-8 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-medium text-foreground">No maintenance records</p>
                          <p className="text-xs text-muted-foreground max-w-[200px] mt-1 mb-4">Protect the lifespan of this asset by logging service history.</p>
                          <Link href="/care/create">
                            <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg">Add Record</Button>
                          </Link>
                        </>
                      )}
                   </div>
                </div>
                
                {/* Investment History */}
                <div className="pt-10">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Investment History</h3>
                    <Link href="/money/create">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-primary">Log Expense</Button>
                    </Link>
                   </div>
                   <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                      {expenses.length > 0 ? (
                        <div className="text-left w-full space-y-3">
                           { }
                           {expenses.map((exp: any) => (
                             <Link href={`/money/${exp.id}`} key={exp.id}>
                               <div className="flex items-center justify-between p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{exp.title}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(exp.expenseDate), "dd/MM/yyyy")} • {exp.category}</p>
                                  </div>
                                  <p className="font-serif font-medium text-primary">{formatCurrency(exp.amount, exp.currency || activeHome?.currency || 'USD')}</p>
                               </div>
                             </Link>
                           ))}
                        </div>
                      ) : (
                        <>
                          <Banknote className="w-8 h-8 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-medium text-foreground">No expenses recorded</p>
                          <p className="text-xs text-muted-foreground max-w-[200px] mt-1 mb-4">Log maintenance costs or repairs to track the true cost of ownership.</p>
                          <Link href="/money/create">
                            <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg">Add Record</Button>
                          </Link>
                        </>
                      )}
                   </div>
                </div>
                
                
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm">
                  {activities && activities.length > 0 ? (
                    <Timeline>
                      {activities.map((act, i) => (
                        <TimelineItem 
                          key={act.id}
                          icon={Activity}
                          title={act.type.replace(/_/g, ' ')}
                          description={act.description}
                          time={new Date(act.createdAt).toLocaleDateString()}
                          isLast={i === activities.length - 1}
                        />
                      ))}
                    </Timeline>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Sidecars */}
        <div className="lg:col-span-4 space-y-6">
          

          {/* Visual Relationships */}
          <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm">
             <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-6">Connections</h3>
             
             <div className="flex flex-col gap-4 relative">
               <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border/50 z-0" />
               
               <div className="flex items-center gap-4 relative z-10 group">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                   <Wrench className="h-5 w-5" />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-bold tracking-widest uppercase text-primary">Service Health</p>
                   {upcomingService ? (
                     <p className="text-sm font-medium truncate">Due {new Date(upcomingService.scheduledDate).toLocaleDateString()}</p>
                   ) : lastMaintenance ? (
                     <p className="text-sm font-medium truncate">Last serviced {new Date(lastMaintenance.completedDate).toLocaleDateString()}</p>
                   ) : (
                     <p className="text-sm font-medium truncate">No service records</p>
                   )}
                 </div>
               </div>

               <div className="flex items-center gap-4 relative z-10 group">
                 <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110">
                   <Tag className="h-5 w-5 text-muted-foreground" />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Space</p>
                   <p className="text-sm font-medium truncate">{asset.space?.name || "Unassigned"}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4 relative z-10 group">
                 <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110">
                   <FileText className="h-5 w-5 text-muted-foreground" />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Documents</p>
                   <p className="text-sm font-medium truncate">{documents.length} attached</p>
                 </div>
               </div>
             </div>
          </div>

          {/* QR Identity */}
          <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-4 w-full text-left">Digital Identity</h3>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-border/40 inline-block mb-4 hover:scale-105 transition-transform duration-500">
              <QRCodeSVG value={qrUrl} size={140} level="M" />
            </div>
            <p className="text-xs text-muted-foreground px-2 mb-4">
              Unique digital tag. Print and attach to your physical object for quick scanning.
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 rounded-xl text-xs"><Share2 className="h-3 w-3 mr-2" /> Share</Button>
              <Button variant="secondary" className="flex-1 rounded-xl text-xs">Print Tag</Button>
            </div>
          </div>
          
          {relationshipsPanel}

        </div>
      </div>
    </div>
  );
}
