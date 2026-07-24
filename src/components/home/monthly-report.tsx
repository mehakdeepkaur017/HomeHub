"use client";

import { motion } from "framer-motion";
import { MonthlyReport as MonthlyReportType } from "@/lib/intelligence/reports";
import { useHome } from "@/components/providers/home-provider";
import { formatCurrency } from "@/lib/utils";

export function MonthlyReport({ report }: { report: MonthlyReportType }) {
  const { activeHome } = useHome();
  if (!report) return null;

  return (
    <div className="space-y-12 pb-10">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{report.month} Snapshot</h2>
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Editorial Report</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
        
        <ReportItem 
          title="Assets Added" 
          value={report.newAssets.toString()} 
          delay={0.1}
        />

        <ReportItem 
          title="Maintenance Completed" 
          value={report.maintenanceCompleted.toString()} 
          delay={0.2}
        />

        <ReportItem 
          title="Money Invested" 
          value={formatCurrency(report.moneySpent, activeHome?.currency || "USD")} 
          delay={0.3}
        />

        <ReportItem 
          title="Family Contributions" 
          value={`${report.familyParticipation} Activities`} 
          delay={0.4}
        />

      </div>
    </div>
  );
}

function ReportItem({ title, value, delay }: { title: string, value: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col space-y-4 relative"
    >
      <div className="absolute top-0 left-0 w-8 h-px bg-primary/20 -translate-y-4" />
      <span className="text-3xl lg:text-4xl font-serif text-foreground tracking-tight">{value}</span>
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
    </motion.div>
  );
}
