import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";
import { sendNotification } from "@/lib/services/notification";

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
      return NextResponse.json({ error: `Invitation is already ${invitation.status.toLowerCase()}` }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    if (invitation.email && invitation.email !== req.user.email) {
      return NextResponse.json({ error: "This invitation is for a different email address" }, { status: 403 });
    }

    // Add user to Home
    await prisma.membership.create({
      data: {
        userId: req.user.id,
        homeId: invitation.homeId,
        role: invitation.role,
      },
    });

    // Mark as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    await logActivity({
      type: "MEMBER_JOINED",
      description: `${req.user.email} joined the home.`,
      homeId: invitation.homeId,
      userId: req.user.id,
    });

    await sendNotification({
      title: "New Member",
      description: `${req.user.email} joined ${invitation.home.name}`,
      homeId: invitation.homeId,
      userId: invitation.invitedById, // notify the inviter
      category: "INVITATION",
    });

    return NextResponse.json({ success: true, homeId: invitation.homeId });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
