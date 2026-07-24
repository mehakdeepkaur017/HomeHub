"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function JoinHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    try {
      const res = await fetch("/api/invitations/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join home");
      }

      router.push("/welcome");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background pointer-events-none" />
      
      <div className="absolute top-8 left-8 z-20">
        <Link href="/onboarding" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="space-y-4 text-center mb-8 flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
            <KeyRound className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Join a Home</h1>
          <p className="text-muted-foreground text-sm">
            Enter the invitation code provided by a family member to join their household.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium pl-1 text-foreground/80">Invitation Code</label>
              <input
                name="code"
                type="text"
                required
                className="w-full h-12 px-4 py-2 text-center text-2xl tracking-[0.3em] uppercase bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="ABC-123"
                maxLength={10}
              />
            </div>

            <Button type="submit" className="w-full rounded-xl h-12 text-base font-medium shadow-none mt-4 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Verifying..." : "Join Home"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
