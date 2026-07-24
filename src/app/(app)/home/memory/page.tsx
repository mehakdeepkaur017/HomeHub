import { PageHeader } from "@/components/layout/page-header";
import { TimelineClient } from "./components/timeline-client";
import { cookies } from "next/headers";
import { PageLoading } from "@/components/ui/page-loading";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <PageHeader 
        title="Home Memory" 
        description="The living memory and history of your home."
      />
      <TimelineClient />
    </div>
  );
}
