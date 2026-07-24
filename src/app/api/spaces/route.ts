import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";

export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const spaces = await prisma.space.findMany({
      where: {
        homeId: req.home!.id,
        archived: false,
      },
      include: {
        _count: {
          select: {
            assets: true,
            activities: true,
          }
        }
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json({ success: true, spaces });
  } catch (error) {
    console.error("Fetch spaces error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const POST = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, icon, color, description, floor, coverImage, parentSpaceId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Determine the next display order
    const maxOrderSpace = await prisma.space.findFirst({
      where: { homeId: req.home!.id, archived: false },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    
    const displayOrder = (maxOrderSpace?.displayOrder ?? 0) + 1;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const space = await prisma.space.create({
      data: {
        name,
        slug,
        icon,
        color,
        description,
        floor,
        coverImage,
        displayOrder,
        homeId: req.home!.id,
        parentSpaceId,
      },
    });

    await logActivity({
      type: "SPACE_CREATED",
      description: `Created space: ${name}`,
      homeId: req.home!.id,
      userId: req.user.id,
      severity: "INFO",
      metadata: { spaceId: space.id }
    });

    return NextResponse.json({ success: true, space });
  } catch (error) {
    console.error("Create space error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const PUT = withHomeAuth(async (req: AuthenticatedRequest) => {
  // Batch update for reordering
  try {
    const { items } = await req.json();
    
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    // Update orders concurrently
    await Promise.all(
      items.map((item: { id: string; displayOrder: number }) => 
        prisma.space.update({
          where: { id: item.id, homeId: req.home!.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder spaces error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
