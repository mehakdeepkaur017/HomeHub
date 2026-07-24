import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ModuleSkeleton } from "@/components/ui/module-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyCareIllustration } from "@/components/ui/illustrations";
import { CareDashboardClient } from "./components/care-dashboard-client";

export const dynamic = "force-dynamic";

export default async function CarePage() {
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    redirect("/select-home");
  }

  // Efficient aggregate queries
  const allMaintenance = await prisma.maintenance.findMany({
    where: { homeId },
    include: {
      space: { select: { id: true, name: true } },
      asset: { select: { id: true, name: true } },
    },
    orderBy: { scheduledDate: "asc" }
  });

  const assetsCount = await prisma.asset.count({ where: { homeId } });

  if (allMaintenance.length === 0) {
    return (
      <div className="pt-24">
        <EmptyState
          illustration={<EmptyCareIllustration />}
          title="Your home is running smoothly."
          description="Keep it that way by scheduling routine maintenance like changing AC filters or inspecting the roof."
          actionLabel="Schedule Task"
          actionHref="/care/create"
        />
      </div>
    );
  }

  return (
    <CareDashboardClient 
      initialMaintenance={allMaintenance} 
      totalAssets={assetsCount} 
    />
  );
}
