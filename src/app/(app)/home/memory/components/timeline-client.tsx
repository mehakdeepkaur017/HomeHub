"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useHome } from "@/components/providers/home-provider";
import { useState, useMemo, useEffect } from "react";
import { isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, format } from "date-fns";
import { TimelineCard } from "@/components/timeline/timeline-card";
import { TimelineMilestone } from "@/components/timeline/timeline-milestone";
import { Button } from "@/components/ui/button";
import { Box, FileText, Wrench, Banknote, Users, Activity, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All", icon: Activity },
  { id: "spaces", label: "Spaces", icon: Box },
  { id: "assets", label: "Assets", icon: Box },
  { id: "vault", label: "Vault", icon: FileText },
  { id: "care", label: "Care", icon: Wrench },
  { id: "money", label: "Money", icon: Banknote },
  { id: "family", label: "Family", icon: Users },
];

export function TimelineClient({ targetId, targetType }: { targetId?: string, targetType?: string }) {
  const { activeHome } = useHome();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["timeline", activeHome?.id, activeFilter, debouncedSearch, targetId],
    queryFn: async ({ pageParam = null }) => {
      const url = new URL("/api/timeline", window.location.origin);
      if (pageParam) url.searchParams.set("cursor", pageParam);
      if (activeFilter !== "all") url.searchParams.set("module", activeFilter);
      if (targetId) url.searchParams.set("targetId", targetId);
      if (targetType) url.searchParams.set("targetType", targetType);
      if (debouncedSearch) url.searchParams.set("q", debouncedSearch);

      const res = await fetch(url.toString(), {
        headers: { "x-home-id": activeHome!.id }
      });
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!activeHome?.id,
    initialPageParam: null,
  });

   
  const groupedActivities = useMemo(() => {
    if (!data) return [];
    const allActivities = data.pages.flatMap((page) => page.items);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: { label: string; items: any[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "This Week", items: [] },
      { label: "This Month", items: [] },
      { label: "Earlier This Year", items: [] }
    ];

    allActivities.forEach((activity) => {
      const date = new Date(activity.createdAt);
      if (isToday(date)) {
        groups[0].items.push(activity);
      } else if (isYesterday(date)) {
        groups[1].items.push(activity);
      } else if (isThisWeek(date)) {
        groups[2].items.push(activity);
      } else if (isThisMonth(date)) {
        groups[3].items.push(activity);
      } else if (isThisYear(date)) {
        groups[4].items.push(activity);
      } else {
        const year = format(date, "yyyy");
        let yearGroup = groups.find(g => g.label === year);
        if (!yearGroup) {
          yearGroup = { label: year, items: [] };
          groups.push(yearGroup);
        }
        yearGroup.items.push(activity);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [data]);

  return (
    <div className="space-y-8 pb-32">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-foreground text-background" 
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}
        </div>
        
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <input 
             type="text"
             placeholder="Search timeline..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-10 pl-9 pr-4 rounded-full bg-secondary/50 border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
           />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mt-8">
        {status === "pending" && (
          <div className="flex justify-center py-12 text-muted-foreground text-sm font-bold tracking-widest uppercase">
            Loading memories...
          </div>
        )}

        {status === "success" && groupedActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
               <Activity className="h-8 w-8 text-muted-foreground" />
             </div>
             <p className="font-serif text-2xl mb-2">No memories found</p>
             <p className="text-muted-foreground">This part of the story hasn&apos;t been written yet.</p>
          </div>
        )}

        {groupedActivities.map((group, groupIdx) => (
          <div key={group.label} className="mb-12 relative">
             <div className="sticky top-24 z-10 inline-block bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/50 text-[10px] font-bold tracking-widest uppercase text-muted-foreground ml-2 sm:ml-4 shadow-sm mb-4">
               {group.label}
             </div>
             
             <div className="space-y-0">
               {group.items.map((activity, idx) => {
                 const isLastInGroup = idx === group.items.length - 1;
                 const isAbsoluteLast = isLastInGroup && groupIdx === groupedActivities.length - 1 && !hasNextPage;
                 
                 return activity.isMilestone ? (
                   <TimelineMilestone 
                     key={activity.id} 
                     activity={activity} 
                     isLast={isAbsoluteLast} 
                   />
                 ) : (
                   <TimelineCard 
                     key={activity.id} 
                     activity={activity} 
                     isLast={isAbsoluteLast} 
                   />
                 );
               })}
             </div>
          </div>
        ))}

        {hasNextPage && (
           <div className="flex justify-center pt-8 pb-12">
             <Button
               variant="outline"
               className="rounded-full px-8 bg-background border-border shadow-sm hover:border-primary/50"
               onClick={() => fetchNextPage()}
               disabled={isFetchingNextPage}
             >
               {isFetchingNextPage ? "Recalling..." : "Load Older Memories"}
             </Button>
           </div>
        )}
      </div>
    </div>
  );
}
