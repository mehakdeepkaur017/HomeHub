import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const homeId = req.home!.id;
    const resolvedParams = await Promise.resolve(context.params);
    const memberId = resolvedParams.memberId;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_homeId: { userId: memberId, homeId }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            assetsCreated: { where: { homeId, archived: false }, select: { id: true, name: true, createdAt: true } },
            spacesCreated: { where: { homeId, archived: false }, select: { id: true, name: true, createdAt: true } },
            documentsUploaded: { where: { homeId }, select: { id: true, title: true, createdAt: true } },
            maintenanceCompleted: { where: { homeId }, select: { id: true, title: true, completedDate: true } },
            expensesCreated: { where: { homeId }, select: { id: true, title: true, amount: true, expenseDate: true } },
            maintenanceAssigned: { 
              where: { homeId, status: { not: "COMPLETED" } },
              include: { space: true, asset: true },
              orderBy: { scheduledDate: 'asc' }
            },
          }
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const activities = await prisma.activity.findMany({
      where: { homeId, userId: memberId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const user = membership.user;
    
    return NextResponse.json({
      id: user.id,
      membershipId: membership.id,
      role: membership.role,
      joinedAt: membership.createdAt,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      responsibilities: user.maintenanceAssigned,
      contributions: {
        assets: user.assetsCreated,
        spaces: user.spacesCreated,
        documents: user.documentsUploaded,
        maintenance: user.maintenanceCompleted,
        expenses: user.expensesCreated
      },
      activity: activities
    });

  } catch (error) {
    console.error("Family member API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch member data" }, { status: 500 });
  }
});
