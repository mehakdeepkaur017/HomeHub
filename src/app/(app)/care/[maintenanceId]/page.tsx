import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { MaintenanceDetailClient } from "./components/maintenance-detail-client";
import { RelationshipPanel } from "@/components/ui/relationship-panel";

export const dynamic = "force-dynamic";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ maintenanceId: string }>;
}) {
  const resolvedParams = await params;
  const maintenanceId = resolvedParams.maintenanceId;
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    return null;
  }

  const maintenance = await prisma.maintenance.findUnique({
    where: {
      id: maintenanceId,
      homeId: homeId,
    },
    include: {
      space: true,
      asset: true,
      createdBy: true,
      completedBy: true,
      assignedTo: true,
      documents: {
        include: {
          uploadedBy: true,
        }
      },
      expenses: {
        orderBy: { expenseDate: "desc" }
      }
    },
  });

  if (!maintenance) {
    notFound();
  }

  const activities = await prisma.activity.findMany({
    where: {
      homeId: homeId,
      targetId: maintenanceId,
      targetType: "MAINTENANCE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <MaintenanceDetailClient 
      maintenance={maintenance} 
      activities={activities} 
      relationshipsPanel={<RelationshipPanel homeId={homeId} targetId={maintenance.id} targetType="MAINTENANCE" />}
    />
  );
}
