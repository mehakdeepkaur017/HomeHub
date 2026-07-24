"use client";

import { motion } from "framer-motion";
import { PackageOpen, MapPin, FileText, Wrench, CreditCard, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { HomeMetrics } from "@/lib/intelligence/metrics";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useHome } from "@/components/providers/home-provider";

interface HomeOverviewProps {
  metrics: HomeMetrics;
}

export function HomeOverview({ metrics }: HomeOverviewProps) {
  const { activeHome } = useHome();
  const currency = activeHome?.currency || "USD";

  const cards = [
    {
      title: "Assets",
      count: metrics.totalAssets,
      description: "Objects remembered",
      trend: `${metrics.assetsWithDocuments} documented`,
      icon: PackageOpen,
      href: "/assets",
      className: "col-span-1 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 hover:border-blue-500/30",
      iconColor: "text-blue-500"
    },
    {
      title: "Spaces",
      count: metrics.totalSpaces,
      description: "Organized rooms",
      trend: `${metrics.spacesWithDescription} described`,
      icon: MapPin,
      href: "/spaces",
      className: "col-span-1 border-emerald-500/10 hover:border-emerald-500/30",
      iconColor: "text-emerald-500"
    },
    {
      title: "Documents",
      count: metrics.totalDocuments,
      description: "Digital records",
      trend: "Stored securely",
      icon: FileText,
      href: "/vault",
      className: "col-span-1 border-amber-500/10 hover:border-amber-500/30",
      iconColor: "text-amber-500"
    },
    {
      title: "Maintenance",
      count: metrics.totalMaintenance,
      description: "Care tasks tracked",
      trend: `${metrics.completedMaintenance} completed`,
      icon: Wrench,
      href: "/care",
      className: "col-span-1 bg-gradient-to-bl from-rose-500/5 to-transparent border-rose-500/10 hover:border-rose-500/30",
      iconColor: "text-rose-500"
    },
    {
      title: "Money",
      count: formatCurrency(metrics.moneySpent, currency),
      description: "Total investments",
      trend: `${metrics.totalExpenses} expenses logged`,
      icon: CreditCard,
      href: "/money",
      className: "col-span-1 border-purple-500/10 hover:border-purple-500/30",
      iconColor: "text-purple-500"
    },
    {
      title: "Family",
      count: metrics.totalMembers,
      description: "Active members",
      trend: "Collaborating",
      icon: Users,
      href: "/family",
      className: "col-span-1 border-indigo-500/10 hover:border-indigo-500/30",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Home Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px]">
        {cards.map((card, idx) => (
          <BentoCard key={idx} card={card} delay={idx * 0.1} />
        ))}
      </div>
    </div>
  );
}

function BentoCard({ card, delay }: { card: any; delay: number }) {
  const Icon = card.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={cn(card.className, "group")}
    >
      <Link href={card.href} className="block w-full h-full">
        <div className="w-full h-full p-6 rounded-[2rem] border bg-card/40 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
          <div className="flex items-start justify-between">
            <div className={cn("p-3 rounded-2xl bg-background shadow-sm border border-border/50 shrink-0", card.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 shrink-0">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight mb-1 truncate">{card.count}</h3>
            <p className="text-sm font-medium text-foreground mb-3">{card.title}</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground leading-tight">{card.description}</p>
              <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/60">{card.trend}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
