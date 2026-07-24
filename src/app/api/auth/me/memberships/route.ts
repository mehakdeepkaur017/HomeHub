import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/api-auth";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: {
        userId: req.user.id,
        home: {
          isDeleted: false,
        },
      },
      include: {
        home: {
          select: {
            id: true,
            name: true,
            type: true,
            currency: true,
          }
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    });

    return NextResponse.json({ user, memberships });
  } catch (error) {
    console.error("Fetch memberships error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
