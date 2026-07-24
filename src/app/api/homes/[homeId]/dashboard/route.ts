import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const homeId = resolvedParams.homeId;

    if (homeId !== req.home!.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Fetch raw data for metrics
    const [
      spacesCount,
      assetsCount,
      membershipsCount,
      recentActivities,
      recentAssets,
      newestSpaces,
      pendingInvitations,
      newestMembers,
      documentsCount,
      maintenanceCount,
      expensesCount,
      allSpaces,
      allAssets
    ] = await Promise.all([
      prisma.space.count({ where: { homeId, archived: false } }),
      prisma.asset.count({ where: { homeId, archived: false } }),
      prisma.membership.count({ where: { homeId } }),
      prisma.activity.findMany({
        where: { homeId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { name: true, avatar: true } },
          space: { select: { name: true } },
        }
      }),
      prisma.asset.findMany({
        where: { homeId, archived: false },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { space: { select: { name: true } } }
      }),
      prisma.space.findMany({
        where: { homeId, archived: false },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.invitation.findMany({
        where: { homeId, status: "PENDING" },
        orderBy: { createdAt: "desc" }
      }),
      prisma.membership.findMany({
        where: { homeId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { user: { select: { name: true, avatar: true } } }
      }),
      prisma.document.count({ where: { homeId } }),
      prisma.maintenance.count({ where: { homeId } }),
      prisma.expense.count({ where: { homeId } }),
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    ].sort((a, b) => b.connections - a.connections).slice(0, 10).map(({ connections, ...rest }) => rest);

    // 2. Home Completion Progress (Setup Journey)
    const hasSpaces = spacesCount > 0;
    const hasAssets = assetsCount > 0;
    const hasDocuments = documentsCount > 0;
    const hasMaintenance = maintenanceCount > 0;
    const hasExpenses = expensesCount > 0;
    const hasInvitedFamily = membershipsCount > 1;
    
    const isComplete = hasSpaces && hasAssets && hasDocuments && hasMaintenance && hasExpenses && hasInvitedFamily;

    const completion = {
      hasSpaces,
      hasAssets,
      hasDocuments,
      hasMaintenance,
      hasExpenses,
      hasInvitedFamily,
      isComplete
    };

    // 3. Home Health Engine
    // Deterministic logic based on real data
    let healthScore = 0;
    const isLearning = spacesCount === 0 && assetsCount === 0;

    if (!isLearning) {
      const spaceOrgScore = spacesCount > 0 ? 30 : 0; // Out of 30
      const assetCovScore = assetsCount > 0 ? 40 : 0; // Out of 40
      const familyScore = membershipsCount > 1 ? 30 : 10; // Out of 30

      healthScore = spaceOrgScore + assetCovScore + familyScore;
    }

    // 4. Insights Generation
    const insights: string[] = [];
    if (spacesCount > 0 && assetsCount === 0) {
      insights.push(`You have created ${spacesCount} space${spacesCount > 1 ? 's' : ''}, but haven't added any assets yet.`);
    } else if (assetsCount > 0) {
      insights.push(`You are actively tracking ${assetsCount} digital asset${assetsCount > 1 ? 's' : ''}.`);
    }

    if (membershipsCount === 1) {
      insights.push("Invite family members to collaborate on home management.");
    } else {
      insights.push(`${membershipsCount} members are helping manage your home.`);
    }

    if (recentAssets.length > 0) {
      insights.push(`Most recently added asset: ${recentAssets[0].name}.`);
    }

    return NextResponse.json({
      feed: recentActivities,
      health: {
        score: healthScore,
        isLearning,
        categories: {
          spaceOrganization: spacesCount > 0 ? 100 : 0,
          assetCoverage: assetsCount > 0 ? 100 : 0,
          familyParticipation: membershipsCount > 1 ? 100 : 33,
        }
      },
      insights,
      today: {
        recentAssets,
        newestSpaces,
        pendingInvitations,
        newestMembers,
      },
      completion,
      graphNodes,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
});
