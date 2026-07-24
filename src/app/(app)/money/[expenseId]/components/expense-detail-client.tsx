/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, PackageOpen, Wrench, Calendar, Tag, CreditCard, AlignLeft, ReceiptText, Trash2, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useRecentStore } from "@/store/recent-store";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useHome } from "@/components/providers/home-provider";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

 
export function ExpenseDetailClient({ expense, activities, relationshipsPanel }: { expense: any; activities: any[]; relationshipsPanel?: React.ReactNode }) {
  const router = useRouter();
  const { completion } = useOnboarding();
  const { activeHome } = useHome();
  const [isDeleting, setIsDeleting] = useState(false);
  const addRecent = useRecentStore((state) => state.addRecent);

  useEffect(() => {
    addRecent({
      id: expense.id,
      title: expense.title,
      type: "expense",
      url: `/money/${expense.id}`
    });
  }, [expense.id, expense.title, addRecent]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this expense? This will permanently remove it from your home's financial history.")) return;
    
    setIsDeleting(true);
    try {
      await fetch(`/api/money/${expense.id}`, { method: "DELETE" });
      router.push("/money");
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  // Connected Home Graph Data
  const centralNode: GraphNode = {
    id: expense.id,
    type: "EXPENSE",
    name: expense.title,
    subtitle: `${formatCurrency(expense.amount, expense.currency || activeHome?.currency || 'USD')}`,
    link: `/money/${expense.id}`
  };

  const satellites: GraphNode[] = [];
  if (expense.space) {
    satellites.push({
      id: expense.space.id,
      type: "SPACE",
      name: expense.space.name,
      subtitle: "Related Space",
      link: `/spaces/${expense.space.id}`
    });
  }
  if (expense.asset) {
    satellites.push({
      id: expense.asset.id,
      type: "ASSET",
      name: expense.asset.name,
      subtitle: "Related Asset",
      link: `/assets/${expense.asset.id}`
    });
  }
  if (expense.maintenance) {
    satellites.push({
      id: expense.maintenance.id,
      type: "MAINTENANCE",
      name: expense.maintenance.title,
      link: `/care/${expense.maintenance.id}`
    });
  }
  if (expense.createdBy) {
    satellites.push({
      id: expense.createdBy.id,
      type: "MEMBER",
      name: expense.createdBy.name || "Unknown",
      subtitle: "Added By",
      link: `/family/${expense.createdBy.id}`
    });
  }
  if (expense.approvedBy && expense.approvedBy.id !== expense.createdBy?.id) {
    satellites.push({
      id: expense.approvedBy.id,
      type: "MEMBER",
      name: expense.approvedBy.name || "Unknown",
      subtitle: "Approved By",
      link: `/family/${expense.approvedBy.id}`
    });
  }
  if (expense.documents) {
    expense.documents.forEach((doc: any) => satellites.push({
      id: doc.id,
      type: "DOCUMENT",
      name: doc.title,
      link: `/vault/${doc.id}`
    }));
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24"
    >
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/money" className="inline-flex items-center justify-center p-2 rounded-full hover:bg-secondary/60 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/home/memory?targetId=${expense.id}&targetType=EXPENSE`}>
            <Button variant="outline" size="sm" className="rounded-full shadow-sm text-muted-foreground hover:text-foreground font-bold tracking-widest uppercase text-[10px]">
              History
            </Button>
          </Link>
          <Button variant="ghost" className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={isDeleting}>
             <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="text-center space-y-6">
         <div className="mx-auto w-20 h-20 bg-primary/5 border border-primary/20 rounded-full flex items-center justify-center">
            <ReceiptText className="h-8 w-8 text-primary" />
         </div>
         <div>
            <h1 className="text-5xl font-serif tracking-tight text-primary">{formatCurrency(expense.amount, expense.currency || activeHome?.currency || 'USD')}</h1>
            <p className="text-lg font-medium mt-2">{expense.title}</p>
            <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest">{expense.category}</p>
         </div>
         <div className="flex items-center justify-center gap-4">
            <span className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full",
              expense.status === "PAID" ? "bg-forest/10 text-forest" : 
              expense.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
              "bg-terracotta/10 text-terracotta"
            )}>
               {expense.status}
            </span>
         </div>
      </div>



      {/* Connections (Physical Layer) */}
      {(expense.space || expense.asset || expense.maintenance) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {expense.space && (
            <Link href={`/spaces/${expense.space.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <MapPin className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Space</p>
                   <p className="text-sm font-medium">{expense.space.name}</p>
                 </div>
              </div>
            </Link>
          )}

          {expense.asset && (
            <Link href={`/assets/${expense.asset.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <PackageOpen className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Asset</p>
                   <p className="text-sm font-medium truncate">{expense.asset.name}</p>
                 </div>
              </div>
            </Link>
          )}

          {expense.maintenance && (
            <Link href={`/care/${expense.maintenance.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Wrench className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Service</p>
                   <p className="text-sm font-medium truncate">{expense.maintenance.title}</p>
                 </div>
              </div>
            </Link>
          )}
        </div>
      )}

       {/* Object Story / Details Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
         <section className="space-y-6">
            <div className="bg-card/40 border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Object Story</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Expense Date</p>
                    <p className="text-sm font-medium">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{expense.category}</p>
                  </div>
                </div>

                {expense.paymentMethod && (
                  <div className="flex items-start gap-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Payment Method</p>
                      <p className="text-sm font-medium">{expense.paymentMethod}</p>
                    </div>
                  </div>
                )}

               <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Recorded By</p>
                   { }
                   {expense.createdBy ? (
                     <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-secondary overflow-hidden shrink-0">
                         { }
                         {(expense.createdBy as any).avatar ? <img src={(expense.createdBy as any).avatar} alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{(expense.createdBy as any).name?.charAt(0)}</div>}
                       </div>
                       { }
                       <span className="text-sm font-medium">{(expense.createdBy as any).name}</span>
                     </div>
                   ) : (
                     <span className="text-sm text-muted-foreground">System</span>
                   )}
                 </div>

                 <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Approved By</p>
                   { }
                   {expense.approvedBy ? (
                     <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-secondary overflow-hidden shrink-0">
                         { }
                         {(expense.approvedBy as any).avatar ? <img src={(expense.approvedBy as any).avatar} alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{(expense.approvedBy as any).name?.charAt(0)}</div>}
                       </div>
                       { }
                       <span className="text-sm font-medium">{(expense.approvedBy as any).name}</span>
                     </div>
                   ) : (
                     <span className="text-sm text-muted-foreground">Pending</span>
                   )}
                 </div>
               </div>

               {expense.description && (
                 <div className="flex items-start gap-4">
                   <AlignLeft className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                   <div>
                     <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Notes</p>
                     <p className="text-sm text-muted-foreground leading-relaxed">{expense.description}</p>
                   </div>
                 </div>
               )}
             </div>
           </div>
        </section>

        <section className="space-y-6">
           <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
             <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">History</h2>
             <Timeline>
                {activities.map((act, i) => (
                  <TimelineItem
                    key={act.id}
                    icon={History}
                    title={act.type.replace(/_/g, ' ')}
                    description={act.description}
                    time={new Date(act.createdAt).toLocaleDateString()}
                    isLast={i === activities.length - 1}
                  />
                ))}
             </Timeline>
           </div>
        </section>

        {relationshipsPanel}
      </div>

    </motion.div>
  );
}
