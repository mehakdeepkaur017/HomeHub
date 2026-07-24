import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ModuleSkeleton } from "@/components/ui/module-skeleton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EmptyState } from "@/components/ui/empty-state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EmptyFamilyIllustration } from "@/components/ui/illustrations";
import { FamilyDashboardClient } from "./components/family-dashboard-client";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    redirect("/select-home");
  }

  // To check if there are no other family members, we would query the database here.
  // For now, FamilyDashboardClient handles the empty state internally.

  return <FamilyDashboardClient />;
}
