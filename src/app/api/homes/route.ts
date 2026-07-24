import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/services/activity";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, type, timezone, currency } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Home name is required" }, { status: 400 });
    }

    const home = await prisma.home.create({
      data: {
        name,
        type: type || "OTHER",
        timezone: timezone || "UTC",
        currency: currency || "USD",
        memberships: {
          create: {
            userId: req.user.id,
            role: "OWNER",
          },
        },
      },
    });

    await logActivity({
      type: "HOME_CREATED",
      description: `Home "${name}" was created.`,
      homeId: home.id,
      userId: req.user.id,
      severity: "INFO",
    });

    return NextResponse.json({ success: true, home });
  } catch (error) {
    console.error("Home creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
