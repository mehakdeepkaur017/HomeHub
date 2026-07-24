import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const assetId = resolvedParams.assetId;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        space: true,
        createdBy: {
          select: { name: true, avatar: true }
        }
      },
    });

    if (!asset || asset.homeId !== req.home!.id) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Failed to fetch asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const assetId = resolvedParams.assetId;
    const data = await req.json();

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.homeId !== req.home!.id) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data,
    });

    await logActivity({
      type: "ASSET_UPDATED",
      description: `Asset "${updatedAsset.name}" was updated`,
      homeId: req.home!.id,
      userId: req.user.id,
      severity: "INFO",
      metadata: { assetId: asset.id },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Failed to update asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const assetId = resolvedParams.assetId;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.homeId !== req.home!.id) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await prisma.asset.delete({
      where: { id: assetId },
    });

    await logActivity({
      type: "ASSET_DELETED",
      description: `Asset "${asset.name}" was deleted`,
      homeId: req.home!.id,
      userId: req.user.id,
      severity: "WARNING",
      metadata: { assetId: asset.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
});
