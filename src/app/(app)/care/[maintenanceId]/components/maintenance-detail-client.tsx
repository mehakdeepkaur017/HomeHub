/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Calendar, MapPin, PackageOpen, AlertTriangle, FileText, Banknote, History, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DocumentCard } from "@/app/(app)/vault/components/document-card";

import { useRecentStore } from "@/store/recent-store";
import { useEffect } from "react";

 
export function MaintenanceDetailClient({ maintenance, activities, relationshipsPanel }: { maintenance: any; activities: any[]; relationshipsPanel?: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const addRecent = useRecentStore((state) => state.addRecent);

  useEffect(() => {
    addRecent({
      id: maintenance.id,
      title: maintenance.title,
      type: "maintenance",
      url: `/care/${maintenance.id}`
    });
  }, [maintenance.id, maintenance.title, addRecent]);

  const isCompleted = maintenance.status === "COMPLETED";
  const isOverdue = maintenance.status === "SCHEDULED" && new Date(maintenance.scheduledDate) < new Date();

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/care/${maintenance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/care" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/care" className="hover:text-foreground transition-colors">Care</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{maintenance.title}</span>
          </div>
        </div>
        <Link href={`/home/memory?targetId=${maintenance.id}&targetType=MAINTENANCE`}>
          <Button variant="outline" size="sm" className="rounded-full shadow-sm text-muted-foreground hover:text-foreground font-bold tracking-widest uppercase text-[10px]">
            History
          </Button>
        </Link>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Details & Attachments */}
        <div className="lg:col-span-8 space-y-10">
          
          <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 relative overflow-hidden">
             
             {/* Header */}
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border/50">
                     {maintenance.category}
                   </span>
                   {maintenance.priority === "CRITICAL" || maintenance.priority === "HIGH" ? (
                     <span className="text-[10px] font-bold tracking-widest uppercase text-terracotta flex items-center gap-1">
                       <AlertTriangle className="h-3.5 w-3.5" /> {maintenance.priority}
                     </span>
                   ) : null}
                 </div>
                 <h1 className="text-3xl md:text-4xl font-serif text-primary">{maintenance.title}</h1>
                 {maintenance.description && (
                   <p className="text-muted-foreground max-w-xl">{maintenance.description}</p>
                 )}
               </div>

               {/* Large Status Indicator */}
               <div className={cn(
                 "shrink-0 w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center rotate-[-5deg]",
                 isCompleted ? "border-forest/20 text-forest bg-forest/5" :
                 isOverdue ? "border-terracotta/20 text-terracotta bg-terracotta/5" :
                 "border-primary/20 text-primary bg-primary/5"
               )}>
                 {isCompleted ? <CheckCircle2 className="h-10 w-10 mb-1" /> :
                  isOverdue ? <AlertTriangle className="h-10 w-10 mb-1" /> :
                  <Calendar className="h-10 w-10 mb-1" />}
                 <span className="text-[10px] font-bold tracking-widest uppercase">
                   {isCompleted ? "Done" : isOverdue ? "Overdue" : "Scheduled"}
                 </span>
               </div>
             </div>

           </div>

           {/* Object Story */}
           <section className="space-y-6 mt-8">
             <div className="bg-card/40 border border-border/50 rounded-3xl p-6 md:p-8">
               <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-4">Object Story</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Target</p>
                   {maintenance.asset ? (
                     <div className="flex items-center gap-1.5 text-sm font-medium">
                       <PackageOpen className="h-4 w-4 text-muted-foreground" /> <Link href={`/assets/${maintenance.asset.id}`} className="hover:text-primary transition-colors">{maintenance.asset.name}</Link>
                     </div>
                   ) : maintenance.space ? (
                     <div className="flex items-center gap-1.5 text-sm font-medium">
                       <MapPin className="h-4 w-4 text-muted-foreground" /> <Link href={`/spaces/${maintenance.space.id}`} className="hover:text-primary transition-colors">{maintenance.space.name}</Link>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-sm font-medium">
                       <Wrench className="h-4 w-4 text-muted-foreground" /> Home
                     </div>
                   )}
                 </div>
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Due Date</p>
                   <p className="text-sm font-medium">{new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Frequency</p>
                   <p className="text-sm font-medium capitalize">{maintenance.frequency.toLowerCase()}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Cost</p>
                   <p className="text-sm font-medium">
                     {maintenance.actualCost ? `$${maintenance.actualCost}` : maintenance.estimatedCost ? `Est. $${maintenance.estimatedCost}` : "TBD"}
                   </p>
                 </div>
               </div>
             </div>
           </section>
          
          <section className="space-y-6">
             <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
               <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-6">Responsibilities</h2>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Assigned To</p>
                   { }
                   {maintenance.assignedTo ? (
                     <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-secondary overflow-hidden shrink-0">
                         { }
                         {(maintenance.assignedTo as any).avatar ? <img src={(maintenance.assignedTo as any).avatar} alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{(maintenance.assignedTo as any).name?.charAt(0)}</div>}
                       </div>
                       { }
                       <span className="text-sm font-medium">{(maintenance.assignedTo as any).name}</span>
                     </div>
                   ) : (
                     <span className="text-sm text-muted-foreground">Unassigned</span>
                   )}
                 </div>
                 
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Completed By</p>
                   { }
                   {maintenance.completedBy ? (
                     <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-secondary overflow-hidden shrink-0">
                         { }
                         {(maintenance.completedBy as any).avatar ? <img src={(maintenance.completedBy as any).avatar} alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{(maintenance.completedBy as any).name?.charAt(0)}</div>}
                       </div>
                       { }
                       <span className="text-sm font-medium">{(maintenance.completedBy as any).name}</span>
                     </div>
                   ) : (
                     <span className="text-sm text-muted-foreground">—</span>
                   )}
                 </div>
               </div>
             </div>
          </section>

          <section className="space-y-6">
             <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
               <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Financials</h2>
               {maintenance.expenses && maintenance.expenses.length > 0 ? (
                 <div className="space-y-4">
                   <div className="flex items-center justify-between pb-4 border-b border-border/50">
                      <p className="text-sm font-medium text-muted-foreground">Total Logged Cost</p>
                      { }
                      <p className="text-xl font-serif">${maintenance.expenses.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString()}</p>
                   </div>
                   <div className="space-y-3">
                     { }
                     {maintenance.expenses.map((exp: any) => (
                       <Link href={`/money/${exp.id}`} key={exp.id}>
                         <div className="flex items-center justify-between p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                            <div>
                              <p className="text-sm font-medium">{exp.title}</p>
                              <p className="text-xs text-muted-foreground">{new Date(exp.expenseDate).toLocaleDateString()}</p>
                            </div>
                            <p className="font-serif font-medium text-primary">${exp.amount.toLocaleString()}</p>
                         </div>
                       </Link>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                   <p className="text-sm font-medium text-muted-foreground mb-1">No recorded expenses</p>
                   <Link href={`/money/create?maintenanceId=${maintenance.id}`}>
                     <Button variant="link" className="text-xs h-auto p-0">Log an expense</Button>
                   </Link>
                 </div>
               )}
             </div>
          </section>

          {/* Attachments from Vault */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <FileText className="h-5 w-5 text-muted-foreground" />
                 <h3 className="text-sm font-bold tracking-widest uppercase">Vault Attachments</h3>
               </div>
               <Button variant="outline" size="sm" className="hidden sm:flex text-xs rounded-xl shadow-sm"><FileText className="h-3.5 w-3.5 mr-2" /> Connect Document</Button>
             </div>
             
             {maintenance.documents && maintenance.documents.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 { }
                 {maintenance.documents.map((doc: any) => (
                   <DocumentCard key={doc.id} document={doc} />
                 ))}
               </div>
             ) : (
               <div className="bg-transparent border border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
                 <FileText className="h-8 w-8 opacity-40" />
                 <p className="text-sm">No documents attached.</p>
                 <Button variant="outline" size="sm" className="mt-2 text-xs">Upload Invoice / Report</Button>
               </div>
             )}
          </section>

        </div>

        {/* Right Column: Actions & History */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Actions Card */}
           <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-center">
              {isCompleted ? (
                <div className="space-y-3">
                  <div className="h-16 w-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-forest/20">
                    <CheckCircle2 className="h-8 w-8 text-forest" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">Maintenance Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed by {maintenance.completedBy?.name || "System"} on {new Date(maintenance.completedDate).toLocaleDateString()}.
                  </p>
                  {maintenance.frequency !== "ONCE" && (
                    <div className="mt-4 p-3 bg-secondary rounded-xl text-xs flex items-center justify-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> Next occurrence has been automatically scheduled.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl text-foreground">Action Required</h3>
                  <Button 
                    onClick={handleMarkComplete}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl shadow-float bg-forest hover:bg-forest/90 text-white font-medium"
                  >
                    {loading ? "Updating..." : "Mark as Completed"} <CheckCircle2 className="h-5 w-5 ml-2" />
                  </Button>
                  <Link href={`/money/create?maintenanceId=${maintenance.id}`}>
                    <Button variant="outline" className="w-full h-14 rounded-2xl shadow-sm font-medium">
                      Log Expenses <Banknote className="h-5 w-5 ml-2 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              )}
           </div>

           {/* Timeline */}
           <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-8">
               <History className="h-5 w-5 text-muted-foreground" />
               <h3 className="text-sm font-bold tracking-widest uppercase">History</h3>
             </div>
             
             {activities && activities.length > 0 ? (
                <Timeline>
                  {activities.map((act, i) => (
                    <TimelineItem 
                      key={act.id}
                      icon={Wrench}
                      title={act.type.replace(/_/g, ' ')}
                      description={act.description}
                      time={new Date(act.createdAt).toLocaleDateString()}
                      isLast={i === activities.length - 1}
                    />
                  ))}
                </Timeline>
              ) : (
                <p className="text-sm text-muted-foreground">No history available.</p>
              )}
           </div>
           
           {relationshipsPanel}

        </div>

      </div>
    </div>
  );
}
