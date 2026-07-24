import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        avatar: true,
        phone: true,
        timezone: true,
        language: true,
        createdAt: true 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, phone, timezone, language, avatar } = await req.json();

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(timezone !== undefined && { timezone }),
        ...(language !== undefined && { language }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        timezone: true,
        language: true,
      }
    });

    // Determine the active home context if passed via header (optional for profile updates, but good for activity logging)
    const homeId = req.headers.get("x-home-id");
    if (homeId) {
      await logActivity({
        type: "PROFILE_UPDATED",
        description: `Profile updated by ${user.email}.`,
        homeId,
        userId: user.id,
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
