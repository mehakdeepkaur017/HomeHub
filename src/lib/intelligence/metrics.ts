import { prisma } from "@/lib/prisma";

export interface HomeMetrics {
  totalSpaces: number;
  spacesWithDescription: number;
  
  totalAssets: number;
  assetsWithDocuments: number;
  assetsWithMaintenance: number;
  assetsWithoutSpaces: number;
  
  totalDocuments: number;
  
  totalMaintenance: number;
  overdueMaintenance: number;
  scheduledMaintenance: number;
  completedMaintenance: number;
  
  totalExpenses: number;
  moneySpent: number;
  
  totalMembers: number;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivities: any[];
}

export async function getHomeMetrics(homeId: string): Promise<HomeMetrics> {
  const [
    spaces,
    assets,
    documentsCount,
    maintenances,
    expensesCount,
    expenseAgg,
    membershipsCount,
    recentActivities
  ] = await Promise.all([
    prisma.space.findMany({
      where: { homeId, archived: false },
      select: { description: true }
    }),
    prisma.asset.findMany({
      where: { homeId, archived: false },
      include: {
        _count: {
          select: { documents: true, maintenance: true }
        }
      }
    }),
    prisma.document.count({ where: { homeId } }),
    prisma.maintenance.findMany({
      where: { homeId },
      select: { status: true, scheduledDate: true }
    }),
    prisma.expense.count({ where: { homeId } }),
    prisma.expense.aggregate({
      where: { homeId },
      _sum: { amount: true }
    }),
    prisma.membership.count({ where: { homeId } }),
    prisma.activity.findMany({
      where: { homeId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, avatar: true } },
        space: { select: { name: true } }
      }
    })
  ]);

  const totalSpaces = spaces.length;
  const spacesWithDescription = spaces.filter(s => s.description && s.description.trim() !== "").length;

  const totalAssets = assets.length;
  const assetsWithDocuments = assets.filter(a => a._count.documents > 0).length;
  const assetsWithMaintenance = assets.filter(a => a._count.maintenance > 0).length;
  const assetsWithoutSpaces = assets.filter(a => !a.spaceId).length;

  const totalMaintenance = maintenances.length;
  const completedMaintenance = maintenances.filter(m => m.status === "COMPLETED").length;
  const overdueMaintenance = maintenances.filter(m => m.status !== "COMPLETED" && new Date(m.scheduledDate) < new Date()).length;
  const scheduledMaintenance = maintenances.filter(m => m.status !== "COMPLETED" && new Date(m.scheduledDate) >= new Date()).length;

  return {
    totalSpaces,
    spacesWithDescription,
    totalAssets,
    assetsWithDocuments,
    assetsWithMaintenance,
    assetsWithoutSpaces,
    totalDocuments: documentsCount,
    totalMaintenance,
    overdueMaintenance,
    scheduledMaintenance,
    completedMaintenance,
    totalExpenses: expensesCount,
    moneySpent: expenseAgg._sum.amount || 0,
    totalMembers: membershipsCount,
    recentActivities
  };
}
