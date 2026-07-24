import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { SpacesClient } from "./components/spaces-client";
import { ModuleSkeleton } from "@/components/ui/module-skeleton";

export const dynamic = "force-dynamic";

export default async function SpacesPage() {
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    return <ModuleSkeleton type="grid" />;
  }

  const spaces = await prisma.space.findMany({
    where: {
      homeId,
      archived: false,
    },
    include: {
      _count: {
        select: {
          assets: true,
          activities: true,
        }
      }
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10">
      <PageHeader
        title="Spaces"
        description="Explore the digital twin of your home. Organize your assets, maintenance, and documents by space."
      />
      
      <SpacesClient initialSpaces={spaces} />
    </div>
  );
}
