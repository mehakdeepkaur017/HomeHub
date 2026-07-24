"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { Space } from "@/lib/generated/prisma/client";
import { SpaceCard } from "./space-card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SpacesGrid({ initialSpaces }: { initialSpaces: Space[] }) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  // If initialSpaces changes from parent, sync it
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSpaces(initialSpaces);
    }, 0);
    return () => clearTimeout(timeout);
  }, [initialSpaces]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = spaces.findIndex((s) => s.id === active.id);
      const newIndex = spaces.findIndex((s) => s.id === over.id);
      
      const newSpaces = arrayMove(spaces, oldIndex, newIndex);
      
      // Update display orders
      const updatedSpaces = newSpaces.map((s, index) => ({
        ...s,
        displayOrder: index + 1
      }));

      setSpaces(updatedSpaces);

      try {
        const res = await fetch("/api/spaces", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            items: updatedSpaces.map(s => ({ id: s.id, displayOrder: s.displayOrder }))
          }),
        });

        if (!res.ok) throw new Error("Failed to save order");
        router.refresh();
      } catch {
        toast.error("Failed to save order");
        setSpaces(spaces); // Revert
      }
    }
  };

  const activeSpace = activeId ? spaces.find((s) => s.id === activeId) : null;

  if (spaces.length === 0) {
    return (
      <div className="flex h-[40vh] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">No Spaces Found</h3>
          <p className="text-sm text-muted-foreground">Adjust your filters or create a new space.</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={spaces.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeSpace ? <SpaceCard space={activeSpace} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
