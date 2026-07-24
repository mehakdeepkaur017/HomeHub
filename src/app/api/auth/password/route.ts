import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { comparePassword, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity";

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await comparePassword(currentPassword, user.password);
    
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    // Optional active home passed via header for logging context
    const homeId = req.headers.get("x-home-id");
    if (homeId) {
      await logActivity({
        type: "PASSWORD_CHANGED",
        description: "Password was changed successfully.",
        homeId,
        userId: req.user.id,
        severity: "SUCCESS",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
