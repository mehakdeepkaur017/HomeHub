import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ExpenseDetailClient } from "./components/expense-detail-client";
import { RelationshipPanel } from "@/components/ui/relationship-panel";

export const dynamic = "force-dynamic";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ expenseId: string }> }) {
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    redirect("/select-home");
  }

  const { expenseId } = await params;

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
      homeId
    },
    include: {
      space: { select: { id: true, name: true, icon: true } },
      asset: { select: { id: true, name: true, category: true } },
      maintenance: { select: { id: true, title: true, scheduledDate: true } },
      createdBy: { select: { id: true, name: true, avatar: true } },
      approvedBy: { select: { id: true, name: true, avatar: true } },
      documents: true,
    }
  });

  if (!expense) {
    redirect("/money");
  }

  const activities = await prisma.activity.findMany({
    where: {
      targetId: expenseId,
      homeId
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, avatar: true } }
    }
  });

  return (
    <ExpenseDetailClient 
      expense={expense} 
      activities={activities} 
      relationshipsPanel={<RelationshipPanel homeId={homeId} targetId={expense.id} targetType="EXPENSE" />}
    />
  );
}
