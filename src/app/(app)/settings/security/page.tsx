"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.target as HTMLFormElement);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your password and account security.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
        <h3 className="font-medium mb-4">Change Password</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg">
              Password updated successfully.
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium pl-1 text-foreground/80">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-medium pl-1 text-foreground/80">New Password</label>
            <input
              name="newPassword"
              type="password"
              required
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium pl-1 text-foreground/80">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full h-10 px-3 py-2 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="rounded-xl px-6">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>


    </div>
  );
}
