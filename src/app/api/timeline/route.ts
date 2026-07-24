import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";

export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const moduleFilter = searchParams.get("module"); // spaces, assets, vault, care, money, family
    const targetId = searchParams.get("targetId");
    const targetType = searchParams.get("targetType");
    const q = searchParams.get("q");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { homeId: req.home!.id };

    if (moduleFilter) {
      if (moduleFilter === "spaces") where.type = { startsWith: "SPACE_" };
      if (moduleFilter === "assets") where.type = { startsWith: "ASSET_" };
      if (moduleFilter === "vault") where.type = { startsWith: "DOCUMENT_" };
      if (moduleFilter === "care") where.type = { startsWith: "MAINTENANCE_" };
      if (moduleFilter === "money") where.type = { startsWith: "EXPENSE_" };
      if (moduleFilter === "family") where.type = { in: ["MEMBER_JOINED", "MEMBER_LEFT", "INVITATION_SENT", "INVITATION_ACCEPTED"] };
    }

    if (targetId) {
      where.targetId = targetId;
      // also allow filtering by targetType if provided
      if (targetType) {
         where.targetType = targetType;
      }
    }

    if (q) {
      where.description = { contains: q };
    }

    const pageSize = 20;

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { name: true, avatar: true } },
        space: { select: { name: true, icon: true } },
      }
    });

    let nextCursor: string | null = null;
    if (activities.length > pageSize) {
      const nextItem = activities.pop();
      nextCursor = nextItem?.id || null;
    }

    // Milestone Detection
    // "Automatically detect meaningful milestones. Examples: First Space Created, First Asset Added, First Family Member Invited, 100th Asset..."
    // "Only derive from database events."
    const itemsWithMilestones = await Promise.all(
      activities.map(async (activity) => {
        let isMilestone = false;
        let milestoneTitle = "";

        if (activity.type === "SPACE_CREATED") {
           const count = await prisma.activity.count({
              where: { type: "SPACE_CREATED", homeId: req.home!.id, createdAt: { lte: activity.createdAt } }
           });
           if (count === 1) {
              isMilestone = true;
              milestoneTitle = "First Space Created";
           }
        }
        else if (activity.type === "ASSET_ADDED") {
           const count = await prisma.activity.count({
              where: { type: "ASSET_ADDED", homeId: req.home!.id, createdAt: { lte: activity.createdAt } }
           });
           if (count === 1) {
              isMilestone = true;
              milestoneTitle = "First Asset Added";
           } else if (count === 100) {
              isMilestone = true;
              milestoneTitle = "100th Asset Added!";
           }
        }
        else if (activity.type === "INVITATION_SENT") {
           const count = await prisma.activity.count({
              where: { type: "INVITATION_SENT", homeId: req.home!.id, createdAt: { lte: activity.createdAt } }
           });
           if (count === 1) {
              isMilestone = true;
              milestoneTitle = "First Family Member Invited";
           }
        }
        else if (activity.type === "MAINTENANCE_COMPLETED") {
           const count = await prisma.activity.count({
              where: { type: "MAINTENANCE_COMPLETED", homeId: req.home!.id, createdAt: { lte: activity.createdAt } }
           });
           if (count === 50) {
              isMilestone = true;
              milestoneTitle = "50th Maintenance Completed";
           }
        }

        return {
           ...activity,
           isMilestone,
           milestoneTitle
        };
      })
    );

    return NextResponse.json({
      items: itemsWithMilestones,
      nextCursor,
      hasMore: nextCursor !== null,
    });
  } catch (error) {
    console.error("Timeline API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
