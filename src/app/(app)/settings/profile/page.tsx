"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useHome } from "@/components/providers/home-provider";

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const { activeHomeId } = useHome();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.user;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(activeHomeId && { "x-home-id": activeHomeId })
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setSuccess(true);
      setError("");
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(formData.entries());
    mutation.mutate(payload);
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (!userData) return <div>Error loading profile.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details across all workspaces.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg">
              Profile updated successfully.
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium pl-1 text-foreground/80">Full Name</label>
            <input
              name="name"
              type="text"
              defaultValue={userData.name || ""}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium pl-1 text-foreground/80">Email</label>
            <input
              type="email"
              defaultValue={userData.email}
              disabled
              className="w-full h-10 px-3 py-2 text-sm bg-background/50 border border-border/40 rounded-xl cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-muted-foreground pl-1">Email cannot be changed directly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium pl-1 text-foreground/80">Timezone</label>
              <select
                name="timezone"
                defaultValue={userData.timezone || "UTC"}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>


          </div>

          <div className="pt-2">
            <Button type="submit" disabled={mutation.isPending} className="rounded-xl px-6">
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
