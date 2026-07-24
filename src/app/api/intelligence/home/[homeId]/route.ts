import { NextResponse } from "next/server";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { getHomeMetrics } from "@/lib/intelligence/metrics";
import { generateIntelligenceBriefing } from "@/lib/intelligence/readiness";
import { detectHomeMoments } from "@/lib/intelligence/moments";
import { generateMonthlyReport } from "@/lib/intelligence/reports";
import { generateHomePresence } from "@/lib/intelligence/presence";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const homeId = resolvedParams.homeId;

    if (homeId !== req.home!.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Get Base Metrics
    const metrics = await getHomeMetrics(homeId);

    // 2. Generate Intelligence Briefing
    const briefing = generateIntelligenceBriefing(metrics);

    // 2.5 Generate Moments, Reports & Presence
    const moments = detectHomeMoments(metrics);
    const monthlyReport = generateMonthlyReport(metrics);
    const presence = generateHomePresence(metrics);

    // 3. For graph data, we need the spaces and assets lists, which we can fetch lightly here
    const [allSpaces, allAssets] = await Promise.all([
      prisma.space.findMany({
        where: { homeId, archived: false },
        include: { _count: { select: { assets: true, documents: true, maintenance: true, expenses: true } } }
      }),
      prisma.asset.findMany({
        where: { homeId, archived: false },
        include: { _count: { select: { documents: true, maintenance: true, expenses: true } } }
      })
    ]);

    // Graph Nodes
    const graphNodes = [
      ...allSpaces.map(s => ({
        id: s.id, type: "SPACE", name: s.name, subtitle: "Space", link: `/spaces/${s.id}`,
        connections: s._count.assets + s._count.documents + s._count.maintenance + s._count.expenses
      })),
      ...allAssets.map(a => ({
        id: a.id, type: "ASSET", name: a.name, subtitle: a.category || "Asset", link: `/assets/${a.id}`,
        connections: a._count.documents + a._count.maintenance + a._count.expenses + (a.spaceId ? 1 : 0)
      }))
    ].sort((a, b) => b.connections - a.connections).slice(0, 10).map((node) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { connections, ...rest } = node;
      return rest;
    });

    // Note: connections variable above is excluded from return by object destructuring rest.
    
    return NextResponse.json({
      feed: metrics.recentActivities,
      briefing,
      presence,
      graphNodes,
      moments,
      monthlyReport
    });
  } catch (error) {
    console.error("[INTELLIGENCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
});
