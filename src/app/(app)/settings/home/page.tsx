"use client";

import { useHome } from "@/components/providers/home-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomeSettingsPage() {
  const { activeHome, activeRole } = useHome();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!activeHome) return <div>Loading...</div>;

  const canEdit = activeRole === "OWNER" || activeRole === "ADMIN";
  const isOwner = activeRole === "OWNER";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // API call to update home would go here
      // await fetch(`/api/homes/${activeHome.id}`, { method: 'PATCH', body: JSON.stringify(formData) })
      
      // Simulate success
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight">Home Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the profile of your workspace.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg">
              Settings updated successfully.
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium pl-1 text-foreground/80">Home Name</label>
            <input
              name="name"
              type="text"
              defaultValue={activeHome?.name || ""}
              disabled={!canEdit}
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium pl-1 text-foreground/80">Property Type</label>
              <select
                name="type"
                defaultValue={activeHome?.type || "OTHER"}
                disabled={!canEdit}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="INDEPENDENT_HOUSE">Independent House</option>
                <option value="VILLA">Villa</option>
                <option value="PG">Paying Guest (PG)</option>
                <option value="HOSTEL">Hostel</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium pl-1 text-foreground/80">Currency</label>
              <select
                name="currency"
                defaultValue={activeHome?.currency || "USD"}
                disabled={!canEdit}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {canEdit && (
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="rounded-xl px-6">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </div>

      {isOwner && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h2 className="text-xl font-medium text-destructive tracking-tight">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Irreversible and destructive actions.
            </p>
          </div>
          
          <div className="border border-destructive/20 rounded-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-4 border-b border-destructive/10 bg-destructive/5">
              <div>
                <h3 className="font-medium text-sm">Transfer Ownership</h3>
                <p className="text-xs text-muted-foreground mt-1">Transfer this home to another member.</p>
              </div>
              <Button variant="outline" className="text-xs rounded-lg border-destructive/20 hover:bg-destructive/10 text-destructive shrink-0">
                Transfer
              </Button>
            </div>
            <div className="p-4 flex items-center justify-between gap-4 bg-destructive/5">
              <div>
                <h3 className="font-medium text-sm">Delete Home</h3>
                <p className="text-xs text-muted-foreground mt-1">Permanently remove this home and all its data.</p>
              </div>
              <Button variant="destructive" className="text-xs rounded-lg shrink-0 shadow-none">
                Delete Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
