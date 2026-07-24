"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Box, Wallet, Wrench, Shield, Users, Settings, ChevronDown, Check, PackageOpen, Folder, FileText, Receipt, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHome } from "@/components/providers/home-provider";
import { useRecentStore } from "@/store/recent-store";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { HeartPulse, AlertCircle, Clock, Activity } from "lucide-react";

const NAV_PILLARS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spaces", label: "Spaces", icon: Box },
  { href: "/assets", label: "Assets", icon: PackageOpen },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/care", label: "Care", icon: Wrench },
  { href: "/vault", label: "Vault", icon: Shield },
  { href: "/family", label: "Family", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, memberships, activeHome, setActiveHomeId } = useHome();
  const recents = useRecentStore((state) => state.recents);

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return null;
      const res = await fetch(`/api/intelligence/home/${activeHome.id}`, {
        headers: { "x-home-id": activeHome.id }
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  const healthScore = dashboard?.briefing?.health?.overallScore;
  const urgentCount = dashboard?.briefing?.recommendations?.urgent?.length || 0;
  const upcomingCount = dashboard?.briefing?.recommendations?.upcoming?.length || 0;

  const userInitials = user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <aside className="w-[280px] border-r border-border/40 bg-background/50 flex flex-col h-full hidden md:flex transition-all duration-300 ease-in-out relative backdrop-blur-2xl">
      {/* Brand & Home Switcher Header */}
      <div className="pt-8 pb-4 px-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between p-3 h-auto hover:bg-secondary/40 rounded-2xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring group">
            <div className="flex items-center gap-4 overflow-hidden text-left">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-foreground flex items-center justify-center shadow-md">
                <span className="text-background text-sm font-bold font-serif italic">H</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-base font-serif font-medium truncate text-foreground leading-tight">
                  {activeHome?.name || "HomeHub"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate uppercase tracking-[0.2em] font-medium mt-0.5">
                  {activeHome?.type.replace('_', ' ') || "Select Home"}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px] rounded-2xl border-border/50 shadow-lg p-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                Your Homes
              </DropdownMenuLabel>
              {memberships.map((m) => (
                <DropdownMenuItem
                  key={m.home.id}
                  onClick={() => setActiveHomeId(m.home.id)}
                  className={cn(
                    "flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer mt-1",
                    m.home.id === activeHome?.id ? "bg-secondary/50" : ""
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.home.name}</span>
                    <span className="text-xs text-muted-foreground capitalize mt-0.5">{m.home.type.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  {m.home.id === activeHome?.id && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/40 my-2" />
            <DropdownMenuItem onClick={() => router.push("/onboarding")} className="py-3 px-3 rounded-xl cursor-pointer text-muted-foreground focus:text-foreground focus:bg-secondary flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                <Box className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Create or Join Home</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Navigation Pillars */}
      <div className="px-4 py-4 flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-none relative">
        <div className="text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase mb-4 px-4">
          Overview
        </div>
        
        {NAV_PILLARS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-colors relative z-10",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-secondary/80 rounded-2xl -z-10 shadow-sm border border-border/30"
                  transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                />
              )}
              <Icon className={cn(
                "h-[18px] w-[18px] transition-transform duration-300",
                isActive ? "stroke-[2.5]" : "stroke-2 group-hover:scale-110"
              )} />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/home/memory"
          className={cn(
            "group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-colors relative z-10 text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="h-[18px] w-[18px] stroke-2 group-hover:scale-110 transition-transform duration-300" />
          Home Memory
        </Link>

        {/* Home Intelligence Mini-Widget */}
        {healthScore !== undefined && (
          <div className="mt-6 mb-2 px-4">
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className={cn("w-4 h-4", healthScore > 80 ? "text-emerald-500" : (healthScore > 50 ? "text-amber-500" : "text-rose-500"))} />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Health</span>
                </div>
                <span className="text-sm font-serif font-medium">{healthScore}/100</span>
              </div>
              
              {(urgentCount > 0 || upcomingCount > 0) && (
                <div className="flex gap-2 pt-2 border-t border-border/40">
                  {urgentCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
                      <AlertCircle className="w-3 h-3" /> {urgentCount} Urgent
                    </div>
                  )}
                  {upcomingCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                      <Clock className="w-3 h-3" /> {upcomingCount} Soon
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {recents.length > 0 && (
          <>
            <div className="text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase mt-8 mb-4 px-4 flex items-center justify-between">
              <span>Recent Objects</span>
            </div>
            {recents.map((item) => {
              let Icon = Box;
              if (item.type === "asset") Icon = PackageOpen;
              else if (item.type === "document") Icon = FileText;
              else if (item.type === "maintenance") Icon = Wrench;
              else if (item.type === "expense") Icon = Receipt;
              else if (item.type === "member") Icon = Users;
              else if (item.type === "space") Icon = Folder;
              
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-medium transition-colors",
                    pathname === item.url 
                      ? "text-primary bg-secondary/50" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="truncate flex-1">{item.title}</span>
                </Link>
              );
            })}
          </>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="p-6 pt-0 space-y-2">
        <Link 
          href="/settings/profile" 
          className="group w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-300"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {user?.avatar ? (
               
              <img src={user.avatar} alt="Avatar" className="h-9 w-9 rounded-full object-cover border border-border/50 shrink-0 shadow-sm group-hover:scale-105 transition-transform" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-secondary border border-border/50 overflow-hidden flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {userInitials}
              </div>
            )}
            <span className="truncate group-hover:translate-x-0.5 transition-transform">{user?.name || user?.email || "Loading..."}</span>
          </div>
          <Settings className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500 shrink-0 ml-2" />
        </Link>
        <button 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate flex-1 text-left">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
