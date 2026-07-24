import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
  home?: {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiHandler = (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: ApiHandler) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: Request, ...args: any[]) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optionally check if user is deleted (could cache this or check in middleware)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isDeleted: true },
    });

    if (!user || user.isDeleted) {
      return NextResponse.json({ error: "Account not found or deleted" }, { status: 403 });
    }

    (req as AuthenticatedRequest).user = {
      id: session.userId,
      email: session.email,
    };

    return handler(req as AuthenticatedRequest, ...args);
  };
}

export function withHomeAuth(handler: ApiHandler, allowedRoles?: ("OWNER" | "ADMIN" | "MEMBER" | "GUEST")[]) {
  return withAuth(async (req, ...args) => {
    // Expecting homeId to be passed via headers for API routes
    // so it doesn't pollute the request body of GET requests.
    const homeId = req.headers.get("x-home-id");

    if (!homeId) {
      return NextResponse.json({ error: "Missing x-home-id header" }, { status: 400 });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_homeId: {
          userId: req.user.id,
          homeId: homeId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden: Not a member of this home" }, { status: 403 });
    }

    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    req.home = {
      id: homeId,
      role: membership.role,
    };

    return handler(req, ...args);
  });
}
