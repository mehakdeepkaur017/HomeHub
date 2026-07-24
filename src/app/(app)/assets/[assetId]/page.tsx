import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AssetDetailClient } from "./components/asset-detail-client";
import { RelationshipPanel } from "@/components/ui/relationship-panel";

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const resolvedParams = await params;
  const assetId = resolvedParams.assetId;
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    // Rely on middleware/layout for redirect, or just return null
    return null;
  }

  // Fetch the asset with its relations
  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId,
      homeId: homeId,
    },
    include: {
      space: true,
      createdBy: true,
      documents: {
        orderBy: { createdAt: "desc" },
      },
      maintenance: {
        orderBy: { scheduledDate: "asc" },
      },
      expenses: {
        orderBy: { expenseDate: "desc" },
      },
    },
  });

  if (!asset) {
    notFound();
  }

  // Fetch activities directly for the timeline, care, and documents
  const activities = await prisma.activity.findMany({
    where: {
      homeId: homeId,
      targetId: assetId,
      targetType: "ASSET",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AssetDetailClient 
      asset={asset} 
      activities={activities} 
      relationshipsPanel={<RelationshipPanel homeId={homeId} targetId={asset.id} targetType="ASSET" />}
    />
  );
}
