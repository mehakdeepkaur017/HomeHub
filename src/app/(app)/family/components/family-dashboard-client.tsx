"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useHome } from "@/components/providers/home-provider";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Shield, Check, Copy, Mail, Clock, Activity, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Card } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/use-onboarding";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export function FamilyDashboardClient() {
  const { activeHome } = useHome();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);
  const { completion } = useOnboarding();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["family", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return null;
      const res = await fetch("/api/family", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch family data");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/homes/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-home-id": activeHome!.id },
        body: JSON.stringify({ role: inviteRole, email: inviteEmail })
      });
      const resData = await res.json();
      if (resData.success && resData.invitation) {
        setNewInviteCode(resData.invitation.code);
      }
      setInviteEmail("");
      setInviteRole("MEMBER");
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Revoke this invitation?")) return;
    try {
      await fetch(`/api/homes/invitations?id=${id}`, {
        method: "DELETE",
        headers: { "x-home-id": activeHome!.id }
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading || !data) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10 animate-pulse">
         <div className="h-10 bg-secondary/50 rounded-xl w-48 mb-8" />
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="h-24 bg-secondary/50 rounded-2xl" /><div className="h-24 bg-secondary/50 rounded-2xl" /></div>
      </div>
    );
  }

  const { overview, members, invitations, recentActivity } = data;

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10">
      
      <PageHeader
        title="The People"
        description="Collaborate, assign responsibilities, and manage access."
        actions={
          <Button onClick={() => { setInviteModalOpen(true); setNewInviteCode(null); }} className="rounded-2xl h-12 px-6 shadow-float bg-primary text-primary-foreground shrink-0">
             <UserPlus className="h-5 w-5 mr-2" /> Invite Member
          </Button>
        }
      />

      {/* Household Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Total Members</p>
           <p className="text-3xl font-serif">{overview.totalMembers}</p>
         </div>
         <div className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Total Contributions</p>
           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
           <p className="text-3xl font-serif">{members.reduce((sum: number, m: any) => sum + m.stats.contributions, 0)}</p>
         </div>
         <div className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Avg Participation</p>
           <p className="text-3xl font-serif">{overview.averageParticipation} <span className="text-sm text-muted-foreground font-sans font-medium">acts/member</span></p>
         </div>
         <div className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Pending Invites</p>
           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
           <p className="text-3xl font-serif">{invitations.filter((i: any) => i.status === "PENDING").length}</p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Members & Invitations */}
        <div className="lg:col-span-2 space-y-12">
          
          <section className="space-y-6">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Household Members</h2>
            
            {members.length === 1 && !completion.isComplete ? (
              <Card className="p-8 md:p-16 border border-border/50 bg-card shadow-sm rounded-[2.5rem]">
                <EmptyState
                  icon={Users}
                  title="A home becomes smarter when everyone contributes."
                  description="Invite family members, roommates, or property managers to collaborate on managing your household."
                  actionLabel="Invite Family"
                  onAction={() => setInviteModalOpen(true)}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {members.map((member: any) => (
                <Link href={`/family/${member.id}`} key={member.id}>
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="group relative p-6 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                         <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden shrink-0">
                           {member.avatar ? (
                                   <img src={member.avatar} alt={member.name || "Member"} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-serif">
                               {(member.name || member.email || "?").charAt(0).toUpperCase()}
                             </div>
                           )}
                         </div>
                         <span className={cn("px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full",
                           member.role === "OWNER" ? "bg-primary text-primary-foreground" :
                           member.role === "ADMIN" ? "bg-forest/10 text-forest" :
                           "bg-secondary text-muted-foreground"
                         )}>
                           {member.role}
                         </span>
                      </div>
                      
                      <div>
                        <p className="font-serif text-xl group-hover:text-primary transition-colors">{member.name || "Unnamed Member"}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/40">
                         <div>
                           <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Contributions</p>
                           <p className="font-medium">{member.stats.contributions}</p>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Responsibilities</p>
                           <p className="font-medium">{member.stats.activeResponsibilities}</p>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
              </div>
            )}
          </section>

          {invitations.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Pending Invitations</h2>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {invitations.map((invite: any) => (
                  <div key={invite.id} className="group flex items-center justify-between p-4 bg-background border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                     <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-sm">{invite.email || "Invite Link"}</p>
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{invite.role}</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase",
                            invite.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                            invite.status === "ACCEPTED" ? "bg-forest/10 text-forest" :
                            "bg-destructive/10 text-destructive"
                          )}>{invite.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Code: <span className="font-mono text-foreground">{invite.code}</span> • Expires {new Date(invite.expiresAt).toLocaleDateString()}</p>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        {invite.status === "PENDING" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 rounded-lg text-xs hidden sm:flex"
                              onClick={() => copyToClipboard(invite.code)}
                            >
                              {copiedCode === invite.code ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                              Copy Code
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              onClick={() => handleRevoke(invite.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Roles & Activity */}
        <div className="space-y-12">
           <section className="bg-card border border-border/50 rounded-[2rem] p-6 sm:p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
               <Shield className="h-5 w-5 text-primary" />
               <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Household Contributions</h3>
             </div>
             
             <div className="space-y-6">
               {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
               {members.map((member: any) => {
                 const name = member.name ? member.name.split(" ")[0] : "Someone";
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const addedAssets = recentActivity.filter((a: any) => a.userId === member.id && a.type === "ASSET_CREATED").length;
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const completedMaintenance = recentActivity.filter((a: any) => a.userId === member.id && a.type === "MAINTENANCE_COMPLETED").length;
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const addedSpaces = recentActivity.filter((a: any) => a.userId === member.id && a.type === "SPACE_CREATED").length;
                 
                 let summary = "";
                 if (addedAssets > 0) summary = `added ${addedAssets} object${addedAssets > 1 ? 's' : ''}`;
                 else if (completedMaintenance > 0) summary = `completed ${completedMaintenance} maintenance task${completedMaintenance > 1 ? 's' : ''}`;
                 else if (addedSpaces > 0) summary = `added ${addedSpaces} space${addedSpaces > 1 ? 's' : ''}`;
                 else summary = `is actively participating`;

                 return (
                   <div key={member.id}>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-sm font-serif">{name}</span>
                     </div>
                     <p className="text-xs text-muted-foreground">{name} {summary} recently.</p>
                   </div>
                 );
               })}
             </div>
           </section>

           <section className="bg-card border border-border/50 rounded-[2rem] p-6 sm:p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-8">
               <Activity className="h-5 w-5 text-muted-foreground" />
               <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Recent Household Activity</h3>
             </div>
             {recentActivity.length > 0 ? (
               <Timeline>
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {recentActivity.map((act: any, i: number) => (
                   <TimelineItem
                     key={act.id}
                     icon={Clock}
                     title={act.type.replace(/_/g, ' ')}
                     description={act.description}
                     time={new Date(act.createdAt).toLocaleDateString()}
                     isLast={i === recentActivity.length - 1}
                   />
                 ))}
               </Timeline>
             ) : (
               <p className="text-sm text-muted-foreground">No recent activity.</p>
             )}
           </section>
        </div>
      </div>

      {/* Invite Modal (Simulated) */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-card border border-border/50 shadow-xl rounded-3xl w-full max-w-md p-6 sm:p-8">
              <h2 className="text-2xl font-serif text-primary mb-2">{newInviteCode ? "Invitation Sent!" : "Invite Member"}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {newInviteCode 
                  ? "Share this code with your new household member so they can join." 
                  : "Send an invitation code to add someone to this household."}
              </p>
              
              {newInviteCode ? (
                <div className="space-y-6 text-center">
                  <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20">
                    <p className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-widest">Invitation Code</p>
                    <p className="text-5xl font-serif text-primary tracking-widest">{newInviteCode}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => copyToClipboard(newInviteCode)} className="flex-1 rounded-xl h-12 shadow-float bg-primary text-primary-foreground">
                      {copiedCode === newInviteCode ? "Copied!" : "Copy Code"}
                    </Button>
                    <Button variant="outline" onClick={() => setInviteModalOpen(false)} className="flex-1 rounded-xl h-12">
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1">Email Address (Optional)</label>
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full h-12 px-4 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="name@example.com" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1">Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full h-12 px-4 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
                  <Button type="submit" disabled={inviting} className="flex-1 rounded-xl h-12 shadow-float bg-primary text-primary-foreground">
                    {inviting ? "Generating..." : "Generate Code"}
                  </Button>
                </div>
              </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
