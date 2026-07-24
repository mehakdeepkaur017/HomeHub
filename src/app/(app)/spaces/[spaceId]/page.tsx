import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { FadeIn } from "@/components/ui/motion-wrappers";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SpaceDetailClient } from "./components/space-detail-client";
import { RelationshipPanel } from "@/components/ui/relationship-panel";

export const dynamic = "force-dynamic";

export default async function SpaceDetailsPage({ params }: { params: { spaceId: string } | Promise<{ spaceId: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) return null;

  const space = await prisma.space.findUnique({
    where: {
      id: resolvedParams.spaceId,
      homeId,
      archived: false,
    },
    include: {
      assets: { orderBy: { createdAt: "desc" } },
      childSpaces: {
        orderBy: { displayOrder: "asc" }
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      maintenance: {
        orderBy: { scheduledDate: "asc" },
      },
      expenses: {
        orderBy: { expenseDate: "desc" }
      },
      createdBy: {
        select: { name: true, avatar: true }
      },
      activities: { 
        orderBy: { createdAt: "desc" }, 
        take: 10,
        include: { user: { select: { name: true, avatar: true } } }
      },
    }
  });

  if (!space) {
    notFound();
  }

  return (
    <div className="pb-20">
      <FadeIn>
        {/* Massive Edge-to-Edge Hero Section */}
        <div className="relative w-full h-[45vh] min-h-[400px] flex flex-col justify-end">
          {space.coverImage ? (
             
            <img 
              src={space.coverImage} 
              alt={space.name} 
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/20 to-background" />
          )}

          {/* Strong Gradient for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

          {/* Hero Content Wrapper */}
          <div className="relative z-20 max-w-[1400px] mx-auto w-full px-6 lg:px-12 pb-12">
            
            <div className="flex items-center justify-between mb-8">
              <Link href="/spaces" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur px-3 py-1.5 rounded-full border border-border/50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explorer
              </Link>
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="backdrop-blur-md bg-background/50 border-primary/20 text-primary tracking-widest uppercase">
                  {space.floor || "Unassigned Floor"}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Synced
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-foreground drop-shadow-sm leading-tight">
                {space.name}
              </h1>
              {space.description && (
                <p className="text-xl text-muted-foreground font-light max-w-xl leading-relaxed">
                  {space.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-8">
         <SpaceDetailClient 
            space={space} 
            relationshipsPanel={<RelationshipPanel homeId={homeId} targetId={space.id} targetType="SPACE" />} 
         />
      </div>
    </div>
  );
}
