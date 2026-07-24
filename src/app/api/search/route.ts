import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const homeId = req.headers.get("x-home-id");
    if (!homeId) {
      return NextResponse.json({ error: "Missing homeId" }, { status: 400 });
    }

    // Verify user is in home
    const membership = await prisma.membership.findUnique({
      where: { userId_homeId: { userId: session.userId, homeId } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({
        spaces: [],
        assets: [],
        maintenance: [],
        expenses: [],
        documents: [],
        members: []
      });
    }

    // Perform parallel searches
    const [spaces, assets, maintenance, expenses, documents, memberships] = await Promise.all([
      prisma.space.findMany({
        where: {
          homeId,
          archived: false,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ]
        },
        include: {
          _count: {
            select: { assets: true, documents: true, maintenance: true, expenses: true }
          }
        },
        take: 5
      }),
      prisma.asset.findMany({
        where: {
          homeId,
          archived: false,
          OR: [
            { name: { contains: q } },
            { category: { contains: q } },
            { brand: { contains: q } },
            { space: { name: { contains: q } } }
          ]
        },
        include: { 
          space: true,
          _count: { select: { documents: true, maintenance: true, expenses: true } }
        },
        take: 5
      }),
      prisma.maintenance.findMany({
        where: {
          homeId,
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { space: { name: { contains: q } } },
            { asset: { name: { contains: q } } }
          ]
        },
        include: { 
          space: true, 
          asset: true,
          _count: { select: { documents: true, expenses: true } }
        },
        take: 5
      }),
      prisma.expense.findMany({
        where: {
          homeId,
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { space: { name: { contains: q } } },
            { asset: { name: { contains: q } } }
          ]
        },
        include: { 
          space: true, 
          asset: true,
          _count: { select: { documents: true } }
        },
        take: 5
      }),
      prisma.document.findMany({
        where: {
          homeId,
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { space: { name: { contains: q } } },
            { asset: { name: { contains: q } } }
          ]
        },
        include: { space: true, asset: true },
        take: 5
      }),
      prisma.membership.findMany({
        where: {
          homeId,
          user: {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } }
            ]
          }
        },
        include: { user: true },
        take: 5
      })
    ]);

    return NextResponse.json({
      spaces,
      assets,
      maintenance,
      expenses,
      documents,
      members: memberships.map(m => m.user)
    });

  } catch (error) {
    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
