"use client";

import { motion } from "framer-motion";
import { useHome } from "@/components/providers/home-provider";
import { HomePresence } from "@/lib/intelligence/presence";
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HealthCategory {
  name: string;
  score: number;
  explanation: string;
}

interface HomeHealth {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
}

interface HomeBriefingProps {
  health: HomeHealth;
  topAction?: Recommendation;
  isLearning: boolean;
  presence?: HomePresence;
  homeName: string;
  insights?: string[];
}

export function HomeBriefing({ health, topAction, isLearning, presence, homeName, insights = [] }: HomeBriefingProps) {
  const { user } = useHome();
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  if (isLearning || !presence) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="rounded-[2.5rem] bg-gradient-to-b from-primary/5 to-transparent border border-primary/20 p-12 lg:p-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6">Welcome to {homeName}</h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
            Your home's digital foundation is growing. Add your first space to build its digital memory.
          </p>
          <Link href="/spaces" className="mt-10">
            <Button size="lg" className="rounded-full px-8 text-base">Add First Space</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-8 md:p-16 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3 transition-all duration-1000 group-hover:bg-primary/10 group-hover:scale-110" />
        
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-8">Today's Home Brief</h2>
        
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-24 relative z-10">
          
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground">
              Good {timeOfDay}, {firstName}.
            </h1>
            <div className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed space-y-4 max-w-2xl">
              <p className="text-foreground/90 font-normal">{presence.emotionalSummary}</p>
              {topAction && <p>{topAction.description}</p>}
              {insights.map((insight, i) => (
                <p key={i}>{insight}</p>
              ))}
            </div>
          </div>

          <div className="w-full xl:w-[400px] shrink-0 space-y-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Overall Home Health
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-serif tracking-tight text-foreground">{health.overallScore}</span>
                <span className="text-2xl text-muted-foreground font-light">/ 100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-6 border-t border-border/40">
              {health.strengths.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Strengths</h3>
                  <ul className="space-y-3">
                    {health.strengths.slice(0, 3).map((strength, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.3 + i * 0.1 }}
                        key={i} 
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80 leading-snug">{strength}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {health.weaknesses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Needs Attention</h3>
                  <ul className="space-y-3">
                    {health.weaknesses.slice(0, 3).map((weakness, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.4 + i * 0.1 }}
                        key={i} 
                        className="flex items-start gap-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80 leading-snug">{weakness}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
