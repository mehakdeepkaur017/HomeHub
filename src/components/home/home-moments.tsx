"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { HomeMoment } from "@/lib/intelligence/moments";
import { PackageOpen, Wrench, Box, Activity, Users } from "lucide-react";
import { format } from "date-fns";

export function HomeMoments({ moments }: { moments: HomeMoment[] }) {
  if (!moments || moments.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Smart Home Moments</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {moments.slice(0, 4).map((moment, idx) => {
          
          let Icon = Activity;
          if (moment.icon === "PackageOpen") Icon = PackageOpen;
          if (moment.icon === "Wrench") Icon = Wrench;
          if (moment.icon === "Box") Icon = Box;
          if (moment.icon === "Users") Icon = Users;

          return (
            <motion.div key={moment.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (idx * 0.1) }}>
              <Card variant="bento" className="overflow-hidden relative h-full flex flex-col justify-end p-6 min-h-[220px] bg-gradient-to-br from-card/80 to-secondary/30">
                <div className="absolute top-4 right-4 text-muted-foreground/30">
                  <Icon className="w-24 h-24 stroke-[0.5] opacity-20 -rotate-12 translate-x-4 -translate-y-4" />
                </div>
                
                <div className="z-10 mt-auto">
                  <div className="mb-3">
                    <Icon className="w-6 h-6 text-primary mb-2" />
                  </div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                    {format(new Date(moment.date), "MMMM d, yyyy")}
                  </p>
                  <h3 className="text-lg font-serif font-medium leading-tight mb-2 text-foreground">{moment.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{moment.description}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
