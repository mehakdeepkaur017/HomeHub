import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUT = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const data = await req.json();
    const resolvedParams = await Promise.resolve(context.params);
    const { spaceId } = resolvedParams;

    const space = await prisma.space.update({
      where: {
        id: spaceId,
        homeId: req.home!.id,
      },
      data,
    });

    await logActivity({
      type: "SPACE_UPDATED",
      description: `Updated space: ${space.name}`,
      homeId: req.home!.id,
      userId: req.user.id,
      severity: "INFO",
      metadata: { spaceId: space.id }
    });

    return NextResponse.json({ success: true, space });
  } catch (error) {
    console.error("Update space error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { spaceId } = resolvedParams;

    const space = await prisma.space.update({
      where: {
        id: spaceId,
        homeId: req.home!.id,
      },
      data: {
        archived: true,
      },
    });

    await logActivity({
      type: "SPACE_ARCHIVED",
      description: `Archived space: ${space.name}`,
      homeId: req.home!.id,
      userId: req.user.id,
      severity: "WARNING",
      metadata: { spaceId: space.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Archive space error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
