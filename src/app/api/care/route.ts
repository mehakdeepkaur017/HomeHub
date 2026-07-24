import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { Prisma } from "@/lib/generated/prisma/client";

 
export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");
    const assetId = searchParams.get("assetId");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const where: Prisma.MaintenanceWhereInput = {
      homeId: req.home!.id,
    };

    if (spaceId) where.spaceId = spaceId;
    if (assetId) where.assetId = assetId;
    if (status) where.status = status as Prisma.EnumMaintenanceStatusFilter;

    const maintenanceItems = await prisma.maintenance.findMany({
      where,
      orderBy: [
        { scheduledDate: "asc" }
      ],
      take: limit ? parseInt(limit) : undefined,
      include: {
        space: { select: { id: true, name: true, icon: true } },
        asset: { select: { id: true, name: true, coverImage: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
      }
    });

    return NextResponse.json(maintenanceItems);
  } catch (error) {
    console.error("Failed to fetch maintenance:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance" },
      { status: 500 }
    );
  }
});

 
export const POST = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const data = await req.json();

    if (!data.title || !data.category || !data.scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        priority: data.priority || "MEDIUM",
        status: "SCHEDULED",
        scheduledDate: new Date(data.scheduledDate),
        frequency: data.frequency || "ONCE",
        estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : null,
        
        homeId: req.home!.id,
        createdById: req.user!.id,
        
        spaceId: data.spaceId || null,
        assetId: data.assetId || null,
      },
      include: {
        space: true,
        asset: true,
      }
    });

    // Record Activity
    await prisma.activity.create({
      data: {
        type: "MAINTENANCE_SCHEDULED",
        description: `Scheduled maintenance: ${maintenance.title}`,
        targetId: maintenance.id,
        targetType: "MAINTENANCE",
        homeId: req.home!.id,
        userId: req.user!.id,
        spaceId: maintenance.spaceId,
      }
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("Failed to create maintenance:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance" },
      { status: 500 }
    );
  }
});
