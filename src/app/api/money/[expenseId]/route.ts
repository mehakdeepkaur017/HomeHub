import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const expenseId = resolvedParams.expenseId;
    
    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
        homeId: req.home!.id,
      },
      include: {
        space: true,
        asset: true,
        maintenance: true,
        createdBy: { select: { name: true, avatar: true } },
        documents: true,
      }
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const expenseId = resolvedParams.expenseId;
    const data = await req.json();

    const existing = await prisma.expense.findUnique({
      where: { id: expenseId, homeId: req.home!.id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        category: data.category,
        paymentMethod: data.paymentMethod,
        status: data.status,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
        notes: data.notes,
        documents: data.documentIds ? {
          connect: data.documentIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    await prisma.activity.create({
      data: {
        type: "EXPENSE_UPDATED",
        description: `Updated expense: ${updated.title}`,
        targetId: updated.id,
        targetType: "EXPENSE",
        homeId: req.home!.id,
        userId: req.user!.id,
        spaceId: updated.spaceId,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const expenseId = resolvedParams.expenseId;

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId, homeId: req.home!.id }
    });

    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
});
