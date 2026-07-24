"use client";

import React, { useState } from "react";
import { Space } from "@/lib/generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { SpacesGrid } from "./spaces-grid";
import Link from "next/link";
import { FadeIn } from "@/components/ui/motion-wrappers";
import { Section } from "@/components/layout/section";

interface SpacesClientProps {
  initialSpaces: Space[];
}

export function SpacesClient({ initialSpaces }: SpacesClientProps) {
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");

  const filteredSpaces = initialSpaces.filter((space) => {
    if (search && !space.name.toLowerCase().includes(search.toLowerCase()) && !space.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (floorFilter !== "all" && space.floor !== floorFilter) {
      return false;
    }
    return true;
  });

  return (
    <FadeIn className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search spaces..." 
            className="pl-9 bg-background/50 backdrop-blur"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-10 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-border transition-colors cursor-pointer"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
          >
            <option value="all">All Floors</option>
            <option value="Ground">Ground Floor</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
            <option value="Basement">Basement</option>
            <option value="Outdoor">Outdoor</option>
          </select>
          <Link 
            href="/spaces/create" 
            className="flex h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Space
          </Link>
        </div>
      </div>

      <Section>
        <SpacesGrid initialSpaces={filteredSpaces} />
      </Section>
    </FadeIn>
  );
}
