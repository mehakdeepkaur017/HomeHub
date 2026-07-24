import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";

export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const homeId = req.home!.id;

    const memberships = await prisma.membership.findMany({
      where: { homeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            assetsCreated: { where: { homeId }, select: { id: true } },
            maintenanceCompleted: { where: { homeId }, select: { id: true } },
            maintenanceAssigned: { where: { homeId, status: { not: "COMPLETED" } }, select: { id: true } },
            documentsUploaded: { where: { homeId }, select: { id: true } },
            expensesCreated: { where: { homeId }, select: { id: true } },
            spacesCreated: { where: { homeId }, select: { id: true } },
            activities: { where: { homeId }, select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const invitations = await prisma.invitation.findMany({
      where: { homeId },
      orderBy: { createdAt: 'desc' },
    });

    // Recent activities by any member in this home
    const recentActivity = await prisma.activity.findMany({
      where: { homeId },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const totalMembers = memberships.length;
    let averageParticipation = 0;
    
    // Process contributions per member
    const processedMembers = memberships.map(m => {
      const contributions = 
        m.user.assetsCreated.length + 
        m.user.maintenanceCompleted.length + 
        m.user.documentsUploaded.length + 
        m.user.expensesCreated.length + 
        m.user.spacesCreated.length;

      return {
        id: m.userId,
        membershipId: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        stats: {
          contributions,
          assets: m.user.assetsCreated.length,
          maintenance: m.user.maintenanceCompleted.length,
          documents: m.user.documentsUploaded.length,
          expenses: m.user.expensesCreated.length,
          spaces: m.user.spacesCreated.length,
          activeResponsibilities: m.user.maintenanceAssigned.length,
        },
        lastActive: m.user.activities[0]?.createdAt || m.createdAt,
      };
    });

    if (totalMembers > 0) {
      const totalContributions = processedMembers.reduce((sum, m) => sum + m.stats.contributions, 0);
      averageParticipation = Math.round(totalContributions / totalMembers);
    }

    return NextResponse.json({
      overview: {
        totalMembers,
        owners: memberships.filter(m => m.role === 'OWNER').length,
        admins: memberships.filter(m => m.role === 'ADMIN').length,
        members: memberships.filter(m => m.role === 'MEMBER').length,
        guests: memberships.filter(m => m.role === 'GUEST').length,
        averageParticipation,
        newestMember: processedMembers[processedMembers.length - 1],
      },
      members: processedMembers,
      invitations,
      recentActivity
    });
  } catch (error) {
    console.error("Family API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch family data" }, { status: 500 });
  }
});
