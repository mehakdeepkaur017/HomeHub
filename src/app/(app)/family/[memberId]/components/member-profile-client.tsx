"use client";

import { useQuery } from "@tanstack/react-query";
import { useHome } from "@/components/providers/home-provider";
import { ArrowLeft, Box, CheckCircle2, Clock, FileText, LayoutDashboard, Receipt, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";

import { useRecentStore } from "@/store/recent-store";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MemberProfileClient({ memberId, relationshipsPanel }: { memberId: string; relationshipsPanel?: React.ReactNode }) {
  const { activeHome } = useHome();
  const addRecent = useRecentStore((state) => state.addRecent);

  const { data: member, isLoading } = useQuery({
    queryKey: ["family", activeHome?.id, memberId],
    queryFn: async () => {
      const res = await fetch(`/api/family/${memberId}`, { headers: { "x-home-id": activeHome!.id } });
      if (!res.ok) throw new Error("Failed to fetch member");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  useEffect(() => {
    if (member) {
      addRecent({
        id: member.id,
        title: member.name || "Unknown Member",
        type: "member",
        url: `/family/${member.id}`
      });
    }
  }, [member, addRecent]);

  if (isLoading || !member) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-12">
        <div className="flex items-center gap-6"><div className="h-24 w-24 rounded-full bg-secondary" /><div className="space-y-3"><div className="h-6 w-48 bg-secondary rounded" /><div className="h-4 w-32 bg-secondary rounded" /></div></div>
        <div className="h-64 bg-secondary rounded-3xl" />
      </div>
    );
  }

  const { contributions, responsibilities, activity } = member;
  const totalContributions = 
    contributions.assets.length + 
    contributions.spaces.length + 
    contributions.documents.length + 
    contributions.maintenance.length + 
    contributions.expenses.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-32">
      
      <div className="flex items-center justify-between">
        <Link href="/family" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Family
        </Link>
        <Link href={`/home/memory?targetId=${memberId}&targetType=MEMBER`}>
          <Button variant="outline" size="sm" className="rounded-full shadow-sm text-muted-foreground hover:text-foreground font-bold tracking-widest uppercase text-[10px]">
            History
          </Button>
        </Link>
      </div>

      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-border/40">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-secondary flex-shrink-0 border-4 border-background shadow-sm">
           {member.avatar ? (
                   <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-3xl font-serif text-muted-foreground">
               {(member.name || member.email || "?").charAt(0).toUpperCase()}
             </div>
           )}
        </div>
        
        <div>
          <h1 className="text-4xl font-serif text-primary mb-2">{member.name || "Unnamed Member"}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
             <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold tracking-widest uppercase text-[10px]">
               {member.role}
             </span>
             <span className="text-muted-foreground">{member.email}</span>
             <span className="text-muted-foreground">• Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1 space-y-8">
            <section className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
               <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-6">Contribution Summary</h3>
               <div className="space-y-5">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-sm text-muted-foreground"><Box className="h-4 w-4" /> Assets Added</div>
                   <span className="font-medium">{contributions.assets.length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-sm text-muted-foreground"><LayoutDashboard className="h-4 w-4" /> Spaces Created</div>
                   <span className="font-medium">{contributions.spaces.length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-sm text-muted-foreground"><FileText className="h-4 w-4" /> Documents Uploaded</div>
                   <span className="font-medium">{contributions.documents.length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Maintenance Done</div>
                   <span className="font-medium">{contributions.maintenance.length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-sm text-muted-foreground"><Receipt className="h-4 w-4" /> Expenses Logged</div>
                   <span className="font-medium">{contributions.expenses.length}</span>
                 </div>
                 
                 <div className="pt-4 border-t border-border/40 flex justify-between items-center text-primary">
                    <span className="text-xs font-bold tracking-widest uppercase">Total Impact</span>
                    <span className="font-serif text-2xl">{totalContributions}</span>
                 </div>
               </div>
            </section>
            
            {responsibilities.length > 0 && (
              <section className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8 shadow-sm">
                 <h3 className="text-sm font-bold tracking-widest uppercase text-primary mb-6">Active Responsibilities</h3>
                 <div className="space-y-4">
                   {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                   {responsibilities.map((resp: any) => (
                     <div key={resp.id} className="bg-background rounded-2xl p-4 shadow-sm">
                        <p className="font-medium text-sm mb-1">{resp.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> Due: {new Date(resp.scheduledDate).toLocaleDateString()}</p>
                     </div>
                   ))}
                 </div>
              </section>
            )}
         </div>

         <div className="md:col-span-2 space-y-8">

            
            <section className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
               <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-8">Recent Activity</h3>
               {activity.length > 0 ? (
                 <Timeline>
                   {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                   {activity.map((act: any, i: number) => (
                     <TimelineItem
                       key={act.id}
                       icon={CheckCircle2}
                       title={act.type.replace(/_/g, ' ')}
                       description={act.description}
                       time={new Date(act.createdAt).toLocaleDateString()}
                       isLast={i === activity.length - 1}
                     />
                   ))}
                 </Timeline>
               ) : (
                 <p className="text-muted-foreground">No recent activity.</p>
               )}
            </section>
         </div>
      </div>
      
    </div>
  );
}
