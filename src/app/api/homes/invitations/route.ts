import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import crypto from "crypto";
import { logActivity } from "@/lib/services/activity";

// Generate an invite link/code
export const POST = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { role, email } = await req.json();
    const homeId = req.home!.id;

    const validRoles = ["ADMIN", "MEMBER", "GUEST"];
    const inviteRole = validRoles.includes(role) ? role : "MEMBER";

    // Generate unique code (e.g. 8 chars hex)
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        code,
        role: inviteRole as "OWNER" | "ADMIN" | "MEMBER" | "GUEST",
        email: email || null,
        expiresAt,
        homeId,
        invitedById: req.user.id,
      },
    });

    await logActivity({
      type: "INVITATION_CREATED",
      description: `Generated invitation code ${code} for role ${inviteRole}.`,
      homeId,
      userId: req.user.id,
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error("Create invitation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["OWNER", "ADMIN"]);

// List invitations for the home
export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const homeId = req.home!.id;
    const invitations = await prisma.invitation.findMany({
      where: { homeId },
      include: {
        invitedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Fetch invitations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["OWNER", "ADMIN"]);

// Revoke an invitation
export const DELETE = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const inviteId = searchParams.get("id");
    const homeId = req.home!.id;

    if (!inviteId) {
      return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: inviteId }
    });

    if (!invitation || invitation.homeId !== homeId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    await prisma.invitation.update({
      where: { id: inviteId },
      data: { status: "REVOKED" }
    });

    await logActivity({
      type: "INVITATION_REVOKED",
      description: `Revoked invitation ${invitation.code}.`,
      homeId,
      userId: req.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke invitation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["OWNER", "ADMIN"]);
