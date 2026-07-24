"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Sparkles, Activity, Wrench, FileText, 
  History, Banknote, Users, Home, TrendingUp, Lock 
} from "lucide-react";

export function ProductCollage() {
  
  // Staggered animation for the grid items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="w-full relative py-12">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[220px]"
      >
        
        {/* 1. HERO: Intelligence Engine (Span 2x2) */}
        <motion.div variants={item} className="md:col-span-2 md:row-span-2 h-full">
          <Card variant="display" className="h-full w-full p-8 bg-background/90 backdrop-blur-xl border-primary/10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors duration-1000" />
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-forest/10 text-forest border-forest/20 animate-pulse">Running</Badge>
            </div>
            
            <div className="relative z-10 space-y-2 mb-8">
              <h3 className="font-serif text-3xl">Digital Brain</h3>
              <p className="text-muted-foreground text-sm max-w-sm">HomeHub connects your scattered data into a single, proactive intelligence graph.</p>
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-10">
              <div className="space-y-4 bg-secondary/50 p-5 rounded-2xl border border-border/40">
                 <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Processing</span>
                    <span className="font-mono text-xs bg-background px-2 py-1 rounded">home_inspection_2026.pdf</span>
                 </div>
                 <div className="w-full h-2 bg-background rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 3, delay: 0.5, ease: "easeInOut", repeat: Infinity }}
                      className="absolute inset-y-0 left-0 bg-primary" 
                    />
                 </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 2. VALUE / NET WORTH (Span 1x1) */}
        <motion.div variants={item} className="h-full">
          <Card variant="display" className="h-full w-full p-6 bg-card/90 backdrop-blur-xl border-primary/10 flex flex-col justify-between group">
            <div className="flex justify-between items-center text-muted-foreground">
              <Banknote className="w-5 h-5" />
              <TrendingUp className="w-4 h-4 text-forest" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">Tracked Assets</p>
              <h4 className="font-serif text-4xl text-primary">$142k</h4>
              <p className="text-xs text-forest mt-2">+2.4% this year</p>
            </div>
          </Card>
        </motion.div>

        {/* 3. VAULT DOCUMENTS (Span 1x2) */}
        <motion.div variants={item} className="md:row-span-2 h-full">
          <Card variant="display" className="h-full w-full p-6 bg-card/90 backdrop-blur-xl border-primary/10 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-serif text-lg">Secure Vault</h3>
            </div>
            
            <div className="space-y-3 flex-1 overflow-hidden">
               {[
                 { name: "Deed.pdf", tag: "Encrypted" },
                 { name: "Insurance.pdf", tag: "Encrypted" },
                 { name: "Contractor.pdf", tag: "Shared" },
                 { name: "Appraisal.pdf", tag: "Encrypted" },
                 { name: "Tax_2025.pdf", tag: "Encrypted" }
               ].map((doc, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-background transition-colors cursor-default">
                   <FileText className="w-4 h-4 text-primary shrink-0" />
                   <div className="min-w-0">
                     <p className="text-xs font-medium truncate">{doc.name}</p>
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{doc.tag}</p>
                   </div>
                 </div>
               ))}
            </div>
            
            <div className="pt-4 mt-auto border-t border-border/40 text-center">
              <p className="text-xs font-medium text-primary">View all 124 files</p>
            </div>
          </Card>
        </motion.div>

        {/* 4. HOME HEALTH (Span 1x1) */}
        <motion.div variants={item} className="h-full">
          <Card variant="display" className="h-full w-full p-6 bg-forest/5 backdrop-blur-xl border-forest/20 flex flex-col justify-between items-center text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-forest uppercase">Home Health</p>
            
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-forest/20" />
                <motion.circle 
                  initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                  whileInView={{ strokeDashoffset: 251.2 - (251.2 * 0.92) }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                  className="text-forest" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-3xl text-forest">92</span>
              </div>
            </div>
            
            <p className="text-xs text-forest/80 font-medium">Excellent Condition</p>
          </Card>
        </motion.div>

        {/* 5. TIMELINE / ACTIVITY (Span 2x1) */}
        <motion.div variants={item} className="md:col-span-2 h-full">
          <Card variant="display" className="h-full w-full p-6 bg-card/90 backdrop-blur-xl border-primary/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <History className="w-4 h-4" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase">Recent Activity</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background">Live</Badge>
            </div>
            
            <div className="space-y-4">
               <div className="flex gap-4 items-start group">
                 <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Shield className="w-3 h-3" />
                 </div>
                 <div>
                   <p className="text-sm font-medium">System updated to v2.4</p>
                   <p className="text-xs text-muted-foreground mt-0.5">Automated overnight patch applied.</p>
                 </div>
                 <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">2m ago</span>
               </div>
               
               <div className="flex gap-4 items-start group">
                 <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                    <Wrench className="w-3 h-3" />
                 </div>
                 <div>
                   <p className="text-sm font-medium">HVAC Maintenance due</p>
                   <p className="text-xs text-muted-foreground mt-0.5">Scheduled for next Tuesday.</p>
                 </div>
                 <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">5h ago</span>
               </div>
            </div>
          </Card>
        </motion.div>

        {/* 6. SPACES (Span 1x1) */}
        <motion.div variants={item} className="h-full">
          <Card variant="display" className="h-full w-full p-6 bg-card/90 backdrop-blur-xl border-primary/10 flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Spaces</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
               {["Living Room", "Kitchen", "Master Bed", "Office", "Garage"].map((space, i) => (
                 <Badge key={i} variant="outline" className="bg-background hover:bg-primary/5 transition-colors text-xs py-1.5 px-3">
                   {space}
                 </Badge>
               ))}
            </div>
            <div className="mt-auto pt-4 border-t border-border/40">
              <p className="text-xs font-medium text-primary">Manage 8 rooms</p>
            </div>
          </Card>
        </motion.div>

        {/* 7. FAMILY / USERS (Span 1x1) */}
        <motion.div variants={item} className="h-full">
          <Card variant="display" className="h-full w-full p-6 bg-card/90 backdrop-blur-xl border-primary/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Household</span>
            </div>
            
            <div className="flex -space-x-3 my-4">
              <div className="w-12 h-12 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-sm shadow-md z-30">S</div>
              <div className="w-12 h-12 rounded-full border-2 border-background bg-secondary text-secondary-foreground flex items-center justify-center text-sm shadow-md z-20">J</div>
              <div className="w-12 h-12 rounded-full border-2 border-background bg-muted text-muted-foreground flex items-center justify-center text-sm shadow-md z-10">+2</div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Sarah M.</p>
              <p className="text-xs text-muted-foreground">Primary Administrator</p>
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
