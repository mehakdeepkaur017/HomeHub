"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wrench, Calendar as CalendarIcon, CheckCircle2, ShieldAlert, Plus, ArrowRight, Activity, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { MaintenanceCard } from "./maintenance-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MaintenanceCalendar } from "./maintenance-calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/hooks/use-onboarding";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CareDashboardClient({ initialMaintenance, totalAssets }: { initialMaintenance: any[], totalAssets: number }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { completion } = useOnboarding();

  // Health Engine
  const now = new Date();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completed = initialMaintenance.filter((m: any) => m.status === "COMPLETED");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdue = initialMaintenance.filter((m: any) => m.status === "SCHEDULED" && new Date(m.scheduledDate) < now);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcoming = initialMaintenance.filter((m: any) => m.status === "SCHEDULED" && new Date(m.scheduledDate) >= now);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recurring = initialMaintenance.filter((m: any) => m.frequency !== "ONCE");
  


  // Recommendations Engine
  const recommendations = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (totalAssets > 0 && initialMaintenance.filter((m: any) => m.assetId).length === 0) {
    recommendations.push("You have recorded assets, but no maintenance for them. Start by scheduling HVAC or appliance service.");
  }
  if (overdue.length > 0) {
    recommendations.push(`You have ${overdue.length} overdue maintenance task(s). Completing these will improve your home's health score.`);
  }
  if (completed.length > 0 && recurring.length === 0) {
    recommendations.push("All your maintenance is one-time. Consider setting up recurring tasks for filters, alarms, and seasonal checks.");
  }


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10"
    >
      <PageHeader
        title="Routine Care."
        description="The maintenance intelligence system for your entire home."
        actions={
          <Link href="/care/create" className="hidden sm:block">
            <Button className="h-12 rounded-2xl px-6 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Schedule Maintenance
            </Button>
          </Link>
        }
      />

      {initialMaintenance.length === 0 ? (
         <motion.section 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="mt-16"
         >
           <Card className="p-8 md:p-16 border border-border/50 bg-card shadow-sm rounded-[2.5rem]">
             <EmptyState
               icon={Wrench}
               title={!completion.isComplete ? "Prevent future problems." : "Your home is running smoothly."}
               description={!completion.isComplete ? "Prevent future problems by scheduling regular maintenance." : "Schedule maintenance tasks for your appliances and systems to ensure they last longer."}
               actionLabel="Schedule First Task"
               onAction={() => window.location.href = "/care/create"}
             />
           </Card>
         </motion.section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
             
             {/* Recommendations Engine */}
             <Card className="p-8 border border-border/50 rounded-3xl bg-card shadow-sm flex flex-col space-y-6">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Recommendations</h3>
                <div className="flex-1 space-y-4">
                  {recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
             </Card>

             {/* TABS Navigation */}
             <div className="flex items-center gap-6 border-b border-border/40 pb-4">
                <button 
                  onClick={() => setActiveTab("upcoming")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "upcoming" ? "text-primary" : "text-muted-foreground")}
                >
                  Upcoming
                  {activeTab === "upcoming" && (
                    <motion.div layoutId="careTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab("calendar")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "calendar" ? "text-primary" : "text-muted-foreground")}
                >
                  Calendar
                  {activeTab === "calendar" && (
                    <motion.div layoutId="careTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab("history")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "history" ? "text-primary" : "text-muted-foreground")}
                >
                  History
                  {activeTab === "history" && (
                    <motion.div layoutId="careTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
             </div>

             {/* Tab Contents */}
             <div className="min-h-[400px]">
                {activeTab === "upcoming" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     
                     {overdue.length > 0 && (
                       <section>
                         <div className="flex items-center gap-2 mb-4 text-terracotta">
                           <AlertTriangle className="h-4 w-4" />
                           <h2 className="text-sm font-bold tracking-widest uppercase">Overdue</h2>
                         </div>
                         <div className="space-y-4">
                           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                           {overdue.map((m: any) => <MaintenanceCard key={m.id} maintenance={m} />)}
                         </div>
                       </section>
                     )}

                     <section>
                       <div className="flex items-center gap-2 mb-4">
                         <CalendarIcon className="h-4 w-4 text-primary" />
                         <h2 className="text-sm font-bold tracking-widest uppercase">Scheduled</h2>
                       </div>
                       {upcoming.length > 0 ? (
                         <div className="space-y-4">
                           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                           {upcoming.map((m: any) => <MaintenanceCard key={m.id} maintenance={m} />)}
                         </div>
                       ) : (
                         <div className="p-8 border border-border/50 border-dashed rounded-3xl text-center bg-secondary/10">
                           <p className="text-sm text-muted-foreground">No upcoming maintenance scheduled.</p>
                         </div>
                       )}
                     </section>
                  </motion.div>
                )}

                {activeTab === "calendar" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <MaintenanceCalendar maintenance={initialMaintenance} />
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                     <div className="flex items-center gap-2 mb-4 text-forest">
                       <CheckCircle2 className="h-4 w-4" />
                       <h2 className="text-sm font-bold tracking-widest uppercase">Completed</h2>
                     </div>
                     {completed.length > 0 ? (
                       <div className="space-y-4">
                         {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                         {completed.slice(0, 10).map((m: any) => <MaintenanceCard key={m.id} maintenance={m} />)}
                       </div>
                     ) : (
                       <div className="p-8 border border-border/50 border-dashed rounded-3xl text-center bg-secondary/10">
                         <p className="text-sm text-muted-foreground">No maintenance history recorded yet.</p>
                       </div>
                     )}
                  </motion.div>
                )}
             </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             


             {/* Recurring Coverage */}
             <Card className="p-6 border border-border/50 rounded-[2rem] bg-card shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Recurring Coverage</h3>
                  <span className="text-xs font-bold text-primary">{recurring.length} Active</span>
                </div>
                {recurring.length > 0 ? (
                  <div className="space-y-4">
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     {recurring.slice(0, 4).map((m: any) => (
                       <div key={m.id} className="flex justify-between items-center text-sm">
                         <span className="font-medium truncate">{m.title}</span>
                         <span className="text-[10px] font-bold tracking-widest uppercase bg-secondary px-2 py-1 rounded-md text-muted-foreground">{m.frequency}</span>
                       </div>
                     ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Set up recurring schedules for filters, cleaning, and inspections.</p>
                )}
             </Card>

          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Button onClick={() => window.location.href = "/care/create"} size="icon" className="h-14 w-14 rounded-full shadow-float bg-primary text-primary-foreground">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </motion.div>
  );
}
