import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";
import crypto from "crypto";

export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");
    const category = searchParams.get("category");
    const favorite = searchParams.get("favorite");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { homeId: req.home!.id };

    if (spaceId) where.spaceId = spaceId;
    if (category) where.category = category;
    if (favorite === "true") where.favorite = true;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { model: { contains: q } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        space: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
});

export const POST = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const data = await req.json();

    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        category: data.category || "Uncategorized",
        coverImage: data.coverImage || null,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
        condition: data.condition || "GOOD",
        notes: data.notes,
        homeId: req.home!.id,
        spaceId: data.spaceId || null,
        createdById: req.user.id,
        qrCode: crypto.randomBytes(16).toString("hex"),
      },
    });

    await logActivity({
      type: "ASSET_CREATED",
      description: `Asset "${asset.name}" was created`,
      homeId: req.home!.id,
      userId: req.user.id,
      severity: "INFO",
      metadata: { assetId: asset.id },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
});
