"use client";

import { motion } from "framer-motion";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join");
      }

      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">You&apos;ve been invited</h1>
          <p className="text-muted-foreground">
            Accept the invitation to join the workspace.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-sm text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">Invite Code</p>
          <p className="text-2xl font-mono tracking-widest font-semibold mb-8">{code}</p>
          
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg mb-6 text-left">
              {error}
            </div>
          )}

          <Button 
            onClick={handleJoin} 
            className="w-full rounded-xl h-12 text-base font-medium shadow-none" 
            disabled={loading}
          >
            {loading ? "Joining..." : "Accept Invitation"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
