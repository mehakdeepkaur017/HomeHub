import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { Prisma } from "@/lib/generated/prisma/client";

 
export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const spaceId = searchParams.get("spaceId");
    const assetId = searchParams.get("assetId");

    const where: Prisma.DocumentWhereInput = {
      homeId: req.home!.id,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (spaceId) {
      where.spaceId = spaceId;
    }

    if (assetId) {
      where.assetId = assetId;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        space: { select: { id: true, name: true, icon: true } },
        asset: { select: { id: true, name: true, coverImage: true } },
        uploadedBy: { select: { id: true, name: true, avatar: true } },
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
});

 
export const POST = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const data = await req.json();

    if (!data.title || !data.category || !data.file || !data.mimeType || !data.size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        file: data.file,
        mimeType: data.mimeType,
        size: parseInt(data.size),
        tags: data.tags || null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        homeId: req.home!.id,
        uploadedById: req.user!.id,
        spaceId: data.spaceId || null,
        assetId: data.assetId || null,
        memberId: data.memberId || null,
        expenseId: data.expenseId || null,
        maintenanceId: data.maintenanceId || null,
      },
      include: {
        space: true,
        asset: true,
      }
    });

    // Record Activity
    await prisma.activity.create({
      data: {
        type: "DOCUMENT_UPLOADED",
        description: `Uploaded ${document.title}`,
        targetId: document.id,
        targetType: "DOCUMENT",
        homeId: req.home!.id,
        userId: req.user!.id,
        spaceId: document.spaceId,
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
});
