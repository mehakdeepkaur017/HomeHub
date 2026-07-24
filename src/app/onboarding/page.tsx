"use client";

import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingWelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl px-6 z-10 space-y-12"
      >
        <div className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Welcome to HomeHub.</h1>
          <p className="text-lg text-muted-foreground font-light max-w-lg mx-auto">
            What would you like to do? Select an option below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Home Option */}
          <button
            onClick={() => router.push("/onboarding/create")}
            className="group relative flex flex-col p-8 text-left bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl transition-all hover:bg-secondary/40 hover:border-border hover:shadow-sm"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-medium tracking-tight mb-3">Create a New Home</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start managing your own home. Set up spaces, invite family members, and track household assets.
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 transition-all group-hover:bg-primary/10" />
          </button>

          {/* Join Home Option */}
          <button
            onClick={() => router.push("/onboarding/join")}
            className="group relative flex flex-col p-8 text-left bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl transition-all hover:bg-secondary/40 hover:border-border hover:shadow-sm"
          >
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-medium tracking-tight mb-3">Join an Existing Home</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join a home using an invitation code provided by a family member or roommate.
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-10 transition-all group-hover:bg-blue-500/10" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
