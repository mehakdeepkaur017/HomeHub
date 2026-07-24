"use client";

import { motion } from "framer-motion";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { Wrench, PackageOpen, MapPin, FileText, CreditCard, User, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HomeFeedProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activities: any[];
}

export function HomeFeed({ activities }: HomeFeedProps) {
  if (!activities || activities.length === 0) return null;

  const today: any[] = [];
  const yesterday: any[] = [];
  const earlierThisWeek: any[] = [];
  const older: any[] = [];

  activities.forEach(activity => {
    const date = new Date(activity.createdAt);
    if (isToday(date)) today.push(activity);
    else if (isYesterday(date)) yesterday.push(activity);
    else if (isThisWeek(date)) earlierThisWeek.push(activity);
    else older.push(activity);
  });

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Recent Home Activity</h2>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
        {today.length > 0 && <FeedGroup title="Today" items={today} />}
        {yesterday.length > 0 && <FeedGroup title="Yesterday" items={yesterday} />}
        {earlierThisWeek.length > 0 && <FeedGroup title="Earlier This Week" items={earlierThisWeek} />}
        {older.length > 0 && <FeedGroup title="Older" items={older} />}
      </div>
    </div>
  );
}

function FeedGroup({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="relative z-10">
      <div className="flex items-center justify-center mb-8">
        <span className="text-[10px] font-bold tracking-widest uppercase bg-background px-4 py-1.5 rounded-full border border-border/50 text-muted-foreground shadow-sm">
          {title}
        </span>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <FeedItem key={item.id} item={item} idx={idx} />
        ))}
      </div>
    </div>
  );
}

function FeedItem({ item, idx }: { item: any, idx: number }) {
  let Icon = Info;
  let color = "text-muted-foreground";
  let link = "#";

  if (item.type.includes("ASSET")) { Icon = PackageOpen; color = "text-blue-500"; link = item.targetId ? `/assets/${item.targetId}` : "/assets"; }
  if (item.type.includes("SPACE")) { Icon = MapPin; color = "text-emerald-500"; link = item.targetId ? `/spaces/${item.targetId}` : "/spaces"; }
  if (item.type.includes("DOCUMENT")) { Icon = FileText; color = "text-amber-500"; link = "/vault"; }
  if (item.type.includes("MAINTENANCE") || item.type.includes("TASK")) { Icon = Wrench; color = "text-rose-500"; link = "/care"; }
  if (item.type.includes("EXPENSE") || item.type.includes("MONEY")) { Icon = CreditCard; color = "text-purple-500"; link = "/money"; }
  if (item.type.includes("MEMBER") || item.type.includes("USER")) { Icon = User; color = "text-indigo-500"; link = "/family"; }

  const timeStr = format(new Date(item.createdAt), "h:mm a");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: Math.min(idx * 0.1, 0.5), duration: 0.5 }}
      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
    >
      {/* Icon node in center */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border/50 shadow-sm shrink-0 md:order-1 md:absolute md:left-1/2 md:-translate-x-1/2 z-10 group-hover:scale-110 transition-transform duration-300">
        <Icon className={cn("w-5 h-5", color)} />
      </div>

      {/* Content */}
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-[2rem] bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-secondary/20 transition-colors shadow-sm hover:shadow-md cursor-pointer">
        <Link href={link} className="block w-full">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-serif font-medium text-foreground">{item.title}</span>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{timeStr}</span>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
