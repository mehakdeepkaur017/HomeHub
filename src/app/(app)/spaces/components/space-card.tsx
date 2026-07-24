import React from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Package, Activity as ActivityIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Space } from "@/lib/generated/prisma/client";

interface SpaceCardProps {
  space: Space & {
    _count?: {
      assets: number;
      activities: number;
    }
  };
  isOverlay?: boolean;
  isPreview?: boolean;
}

export function SpaceCard({ space, isOverlay, isPreview }: SpaceCardProps) {
  const sortable = useSortable({ id: space.id });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = isPreview 
    ? { attributes: {}, listeners: {}, setNodeRef: undefined, transform: null, transition: undefined, isDragging: false } 
    : sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="workspace"
      className={cn(
        "group relative overflow-hidden h-full flex flex-col p-0 border-transparent",
        isDragging && "opacity-50 ring-2 ring-primary scale-95 shadow-lg",
        isOverlay && "scale-105 shadow-xl ring-2 ring-primary opacity-100 cursor-grabbing",
      )}
    >
      <div 
        className="absolute left-3 top-3 z-20 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing p-2 bg-background/80 backdrop-blur rounded-lg"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <Link href={`/spaces/${space.id}`} className="flex flex-col h-full w-full">
        {/* Cover Image Area (Large) */}
        <div className="relative h-48 w-full bg-secondary/30 overflow-hidden">
          {space.coverImage ? (
             
            <img 
              src={space.coverImage} 
              alt={space.name} 
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/20" />
          )}
          
          {/* Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h3 className="font-serif text-2xl tracking-tight leading-none mb-1 drop-shadow-md">{space.name}</h3>
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest drop-shadow-md">{space.floor || "Unassigned Floor"}</p>
          </div>
        </div>

        {/* Data Grid Area */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between bg-card group-hover:bg-secondary/10 transition-colors duration-300">
           <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Package className="w-3 h-3" /> Assets</span>
                 <span className="font-medium">{space._count?.assets || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ActivityIcon className="w-3 h-3" /> Activity</span>
                 <span className="font-medium">{space._count?.activities || 0}</span>
              </div>
           </div>

           <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
             <div className="flex items-center gap-2">
               {(space._count?.activities || 0) > 0 ? (
                 <>
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-xs text-muted-foreground">Active Recently</span>
                 </>
               ) : (
                 <>
                   <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                   <span className="text-xs text-muted-foreground">Quiet Space</span>
                 </>
               )}
             </div>
             <div className="text-xs font-medium text-primary flex items-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
               Enter Room →
             </div>
           </div>
        </CardContent>
      </Link>
    </Card>
  );
}
