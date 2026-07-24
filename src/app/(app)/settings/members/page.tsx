"use client";

import { useHome } from "@/components/providers/home-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function MembersSettingsPage() {
  const { activeHome, activeRole } = useHome();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  if (!activeHome) return <div>Loading...</div>;

  const canInvite = activeRole === "OWNER" || activeRole === "ADMIN";

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInvite) return;
    
    setLoading(true);
    setInviteCode("");

    const formData = new FormData(e.target as HTMLFormElement);
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;

    try {
      // In a real app we need to pass x-home-id in headers since this is a withHomeAuth API
      const res = await fetch("/api/homes/invitations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-home-id": activeHome.id 
        },
        body: JSON.stringify({ role, email }),
      });

      if (!res.ok) throw new Error("Failed to generate invite");
      
      const data = await res.json();
      setInviteCode(data.invitation.code);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight">Members</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage who has access to {activeHome.name}.
        </p>
      </div>

      {canInvite && (
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-medium">Invite new member</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate a secure code or link to share with them.</p>
          </div>

          <form onSubmit={handleGenerateInvite} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <label className="text-sm font-medium pl-1 text-foreground/80">Email (Optional)</label>
              <input
                name="email"
                type="email"
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2 w-full sm:w-48">
              <label className="text-sm font-medium pl-1 text-foreground/80">Role</label>
              <select
                name="role"
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="rounded-xl h-10 px-6 w-full sm:w-auto">
              {loading ? "Generating..." : "Generate Code"}
            </Button>
          </form>

          {inviteCode && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Invite Code</p>
                <p className="text-xl font-mono tracking-widest font-semibold">{inviteCode}</p>
              </div>
              <Button variant="outline" className="rounded-lg shadow-none" onClick={() => navigator.clipboard.writeText(inviteCode)}>
                Copy
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Placeholder for Member List */}
      <div className="border border-border/50 rounded-2xl overflow-hidden">
        <div className="p-4 bg-secondary/20 border-b border-border/50">
          <h3 className="font-medium text-sm">Active Members</h3>
        </div>
        <div className="p-8 text-center text-sm text-muted-foreground">
          Member list rendering would go here.
        </div>
      </div>
    </div>
  );
}
