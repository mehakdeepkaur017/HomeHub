import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  initials?: string;
  className?: string;
}

export function Avatar({ src, initials, className }: AvatarProps) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/50 bg-secondary/80", className)}>
      {src ? (
         
        <img className="aspect-square h-full w-full object-cover" src={src} alt="Avatar" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-muted-foreground text-sm">
          {initials || "?"}
        </div>
      )}
    </div>
  );
}

interface AvatarStackProps {
  users: Array<{ id: string; name?: string; src?: string }>;
  max?: number;
  className?: string;
}

export function AvatarStack({ users, max = 3, className }: AvatarStackProps) {
  const displayUsers = users.slice(0, max);
  const excess = users.length - max;

  return (
    <div className={cn("flex items-center -space-x-3", className)}>
      {displayUsers.map((user, i) => {
        const initials = user.name
          ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
          : "?";
        
        return (
          <Avatar 
            key={user.id} 
            src={user.src} 
            initials={initials}
            className={cn(
              "ring-2 ring-background transition-transform hover:z-10 hover:scale-110",
              `z-[${max - i}]`
            )} 
          />
        );
      })}
      {excess > 0 && (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-secondary/80 ring-2 ring-background z-0 text-xs font-medium text-muted-foreground">
          +{excess}
        </div>
      )}
    </div>
  );
}
