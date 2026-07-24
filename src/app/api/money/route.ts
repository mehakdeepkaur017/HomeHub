import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { Prisma } from "@/lib/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";

 
export const GET = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");
    const assetId = searchParams.get("assetId");
    const maintenanceId = searchParams.get("maintenanceId");
    const limit = searchParams.get("limit");

    const where: Prisma.ExpenseWhereInput = {
      homeId: req.home!.id,
    };

    if (spaceId) where.spaceId = spaceId;
    if (assetId) where.assetId = assetId;
    if (maintenanceId) where.maintenanceId = maintenanceId;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: [
        { expenseDate: "desc" }
      ],
      take: limit ? parseInt(limit) : undefined,
      include: {
        space: { select: { id: true, name: true, icon: true } },
        asset: { select: { id: true, name: true, coverImage: true } },
        maintenance: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
});

 
export const POST = withHomeAuth(async (req: AuthenticatedRequest) => {
  try {
    const data = await req.json();

    if (!data.title || !data.amount || !data.expenseDate || !data.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        description: data.description || null,
        amount: parseFloat(data.amount),
        currency: data.currency || req.home!.currency || "USD",
        category: data.category,
        paymentMethod: data.paymentMethod || null,
        status: data.status || "PAID",
        expenseDate: new Date(data.expenseDate),
        notes: data.notes || null,
        
        homeId: req.home!.id,
        createdById: req.user!.id,
        
        spaceId: data.spaceId || null,
        assetId: data.assetId || null,
        maintenanceId: data.maintenanceId || null,

        documents: data.documentIds ? {
          connect: data.documentIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        space: true,
        asset: true,
        maintenance: true,
      }
    });

    // Record Activity
    await prisma.activity.create({
      data: {
        type: "EXPENSE_ADDED",
        description: `Logged expense: ${expense.title} (${formatCurrency(expense.amount, expense.currency)})`,
        targetId: expense.id,
        targetType: "EXPENSE",
        homeId: req.home!.id,
        userId: req.user!.id,
        spaceId: expense.spaceId,
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
});
