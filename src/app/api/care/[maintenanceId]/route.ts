import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { MaintenanceFrequency } from "@/lib/generated/prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const maintenanceId = resolvedParams.maintenanceId;
    
    const maintenance = await prisma.maintenance.findUnique({
      where: {
        id: maintenanceId,
        homeId: req.home!.id,
      },
      include: {
        space: true,
        asset: true,
        createdBy: { select: { name: true, avatar: true } },
        completedBy: { select: { name: true, avatar: true } },
        documents: true,
      }
    });

    if (!maintenance) {
      return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("Failed to fetch maintenance:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const maintenanceId = resolvedParams.maintenanceId;
    const data = await req.json();

    const existing = await prisma.maintenance.findUnique({
      where: { id: maintenanceId, homeId: req.home!.id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        completedDate: data.status === "COMPLETED" && existing.status !== "COMPLETED" ? new Date() : undefined,
        completedById: data.status === "COMPLETED" && existing.status !== "COMPLETED" ? req.user!.id : undefined,
        estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
        actualCost: data.actualCost ? parseFloat(data.actualCost) : undefined,
        frequency: data.frequency,
        notes: data.notes,
        documents: data.documentIds ? {
          connect: data.documentIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    // Activity logging
    let activityType = "MAINTENANCE_UPDATED";
    let activityDesc = `Updated maintenance: ${updated.title}`;

    if (data.status === "COMPLETED" && existing.status !== "COMPLETED") {
      activityType = "MAINTENANCE_COMPLETED";
      activityDesc = `Completed maintenance: ${updated.title}`;

      // Auto-spawn recurring maintenance
      if (updated.frequency !== "ONCE") {
        const nextDate = new Date(updated.scheduledDate);
        if (updated.frequency === MaintenanceFrequency.MONTHLY) nextDate.setMonth(nextDate.getMonth() + 1);
        if (updated.frequency === MaintenanceFrequency.QUARTERLY) nextDate.setMonth(nextDate.getMonth() + 3);
        if (updated.frequency === MaintenanceFrequency.YEARLY) nextDate.setFullYear(nextDate.getFullYear() + 1);
        // CUSTOM could have arbitrary rules, default to +1 month for now if custom without params.
        if (updated.frequency === MaintenanceFrequency.CUSTOM) nextDate.setMonth(nextDate.getMonth() + 1);

        await prisma.maintenance.create({
          data: {
            title: updated.title,
            description: updated.description,
            category: updated.category,
            priority: updated.priority,
            status: "SCHEDULED",
            scheduledDate: nextDate,
            frequency: updated.frequency,
            estimatedCost: updated.estimatedCost,
            homeId: updated.homeId,
            spaceId: updated.spaceId,
            assetId: updated.assetId,
            createdById: req.user!.id, // The user completing it effectively spawned the next one
          }
        });
      }
    }

    await prisma.activity.create({
      data: {
        type: activityType,
        description: activityDesc,
        targetId: updated.id,
        targetType: "MAINTENANCE",
        homeId: req.home!.id,
        userId: req.user!.id,
        spaceId: updated.spaceId,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update maintenance:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const maintenanceId = resolvedParams.maintenanceId;

    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId, homeId: req.home!.id }
    });

    if (!maintenance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.maintenance.delete({
      where: { id: maintenanceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete maintenance:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance" },
      { status: 500 }
    );
  }
});
