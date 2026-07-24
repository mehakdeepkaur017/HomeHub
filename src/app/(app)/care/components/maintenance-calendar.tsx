"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MaintenanceCalendar({ maintenance }: { maintenance: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDay = (day: number) => {
    return maintenance.filter((m) => {
      const date = new Date(m.scheduledDate);
      return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
         <h2 className="text-2xl font-serif text-primary">
           {monthNames[month]} {year}
         </h2>
         <div className="flex gap-2">
           <button onClick={prevMonth} className="h-10 w-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
             <ChevronLeft className="h-5 w-5 text-muted-foreground" />
           </button>
           <button onClick={nextMonth} className="h-10 w-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
             <ChevronRight className="h-5 w-5 text-muted-foreground" />
           </button>
         </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-2 sm:gap-4"
        >
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="aspect-square rounded-2xl bg-secondary/10 border border-border/30" />
          ))}
          {days.map(day => {
            const tasks = getTasksForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            
            return (
              <div 
                key={day} 
                className={cn(
                  "aspect-square rounded-2xl border transition-all duration-300 relative flex flex-col p-1 sm:p-2",
                  isToday ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-card border-border/50 hover:bg-secondary/20",
                  tasks.length > 0 && !isToday && "border-primary/20 bg-primary/5"
                )}
              >
                <div className={cn("text-xs font-semibold self-end rounded-full h-6 w-6 flex items-center justify-center", isToday && "bg-primary text-primary-foreground")}>
                  {day}
                </div>
                
                <div className="flex-1 flex flex-col justify-end gap-1 mt-1">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {tasks.slice(0, 2).map((t: any) => {
                    const isOverdue = t.status === "SCHEDULED" && new Date(t.scheduledDate) < new Date();
                    const isCompleted = t.status === "COMPLETED";
                    
                    return (
                      <Link href={`/care/${t.id}`} key={t.id} className="block group">
                        <div className={cn(
                          "text-[10px] sm:text-xs truncate px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border transition-colors",
                          isCompleted ? "bg-forest/10 border-forest/20 text-forest" : 
                          isOverdue ? "bg-terracotta/10 border-terracotta/20 text-terracotta" : 
                          "bg-primary text-primary-foreground border-primary shadow-sm"
                        )}>
                           <div className="flex items-center gap-1">
                             {isCompleted && <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />}
                             {isOverdue && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                             <span className="truncate">{t.title}</span>
                           </div>
                        </div>
                      </Link>
                    );
                  })}
                  {tasks.length > 2 && (
                    <div className="text-[10px] text-muted-foreground text-center font-medium">
                      +{tasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
