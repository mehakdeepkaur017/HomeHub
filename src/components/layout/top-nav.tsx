"use client";

import { Bell, Command, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDrawer } from "@/components/ui/notification-drawer";
import { useUIStore } from "@/store/use-ui-store";
import { motion } from "framer-motion";

export function TopNav() {
  const pathname = usePathname();
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  
  // Basic breadcrumb logic for demo purposes
  const segments = pathname.split("/").filter(Boolean);
  let title = "Overview";
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    // Check if UUID
    if (lastSegment.length === 36 && lastSegment.includes("-")) {
      title = "Details";
    } else {
      title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
  }

  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 hover:bg-secondary border border-border/50 rounded-full px-3 py-1.5 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/50">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
        
        <button 
          onClick={() => setDrawerOpen(true)}
          className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]" 
            />
          )}
        </button>
      </div>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
