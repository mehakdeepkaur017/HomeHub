import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ModuleSkeleton } from "@/components/ui/module-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyMoneyIllustration } from "@/components/ui/illustrations";
import { MoneyDashboardClient } from "./components/money-dashboard-client";

export const dynamic = "force-dynamic";

export default async function MoneyPage() {
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    redirect("/select-home");
  }

  // Efficient aggregate queries
  const allExpenses = await prisma.expense.findMany({
    where: { homeId },
    include: {
      space: { select: { id: true, name: true } },
      asset: { select: { id: true, name: true } },
      maintenance: { select: { id: true, title: true } }
    },
    orderBy: { expenseDate: "desc" }
  });

  if (allExpenses.length === 0) {
    return (
      <div className="pt-24">
        <EmptyState
          illustration={<EmptyMoneyIllustration />}
          title="No financial history yet."
          description="Start tracking expenses, maintenance costs, and home investments to see where your money goes."
          actionLabel="Log Expense"
          actionHref="/money/create"
        />
      </div>
    );
  }

  return (
    <MoneyDashboardClient 
      initialExpenses={allExpenses} 
    />
  );
}
