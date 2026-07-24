import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Invitation code is required" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: { home: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation code" }, { status: 404 });
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "This invitation is no longer valid" }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "This invitation has expired" }, { status: 400 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_homeId: {
          userId: req.user.id,
          homeId: invitation.homeId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: "You are already a member of this home" }, { status: 400 });
    }

    // Process transaction: Create membership and update invitation
    await prisma.$transaction(async (tx) => {
      await tx.membership.create({
        data: {
          userId: req.user.id,
          homeId: invitation.homeId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });
    });

    await logActivity({
      type: "INVITATION_ACCEPTED",
      description: `${req.user.email} joined the home using an invitation.`,
      homeId: invitation.homeId,
      userId: req.user.id,
      severity: "INFO",
    });

    return NextResponse.json({ success: true, home: invitation.home });
  } catch (error) {
    console.error("Join home error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
