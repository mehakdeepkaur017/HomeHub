"use client";

import { motion } from "framer-motion";
import { useHome } from "@/components/providers/home-provider";
import { useEffect, useState } from "react";
import { PageLoading } from "@/components/ui/page-loading";
import { useQuery } from "@tanstack/react-query";
import { HomeBriefing } from "@/components/home/home-briefing";
import { AttentionCenter } from "@/components/home/attention-center";
import { HomeOverview } from "@/components/home/home-overview";
import { HomeFeed } from "@/components/home/home-feed";

import { MonthlyReport } from "@/components/home/monthly-report";

export default function HomePage() {
  const { activeHome } = useHome();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return null;
      const res = await fetch(`/api/intelligence/home/${activeHome.id}`, {
        headers: { "x-home-id": activeHome.id }
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  if (!mounted || !activeHome || isLoading) {
    return <PageLoading />;
  }
  
  const { briefing, moments, monthlyReport, presence, feed, graphNodes } = dashboard || {};
  
  // Extract the top action for the briefing 2.0 (Urgent or Upcoming)
  let topAction = undefined;
  if (briefing?.recommendations) {
    if (briefing.recommendations.urgent?.length > 0) topAction = briefing.recommendations.urgent[0];
    else if (briefing.recommendations.upcoming?.length > 0) topAction = briefing.recommendations.upcoming[0];
    else if (briefing.recommendations.suggestions?.length > 0) topAction = briefing.recommendations.suggestions[0];
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-40 space-y-32"
    >
      {/* Cinematic Home Hero (Briefing 3.0) */}
      {briefing && (
        <section>
          <HomeBriefing 
            health={briefing.health} 
            topAction={topAction}
            isLearning={briefing.isLearning} 
            presence={presence}
            homeName={activeHome.name}
          />
        </section>
      )}

      {!briefing?.isLearning && (
        <>
          {/* 3. Attention Center */}
          {briefing?.recommendations && (
            <section>
              <AttentionCenter attention={briefing.recommendations} />
            </section>
          )}

          {/* 3. Home Overview Bento */}
          {briefing?.metrics && (
            <section>
              <HomeOverview metrics={briefing.metrics} />
            </section>
          )}

          {/* 6. Monthly Home Report */}
          {monthlyReport && (
            <section>
              <MonthlyReport report={monthlyReport} />
            </section>
          )}
        </>
      )}

    </motion.div>
  );
}
