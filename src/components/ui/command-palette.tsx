"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useHome } from "@/components/providers/home-provider";
import { useUIStore } from "@/store/use-ui-store";
import {
  Search,
  Folder,
  Package,
  Wrench,
  Receipt,
  FileText,
  User,
  Plus,
  Home as HomeIcon,
  LayoutDashboard,
  Settings
} from "lucide-react";

export function CommandPalette() {
  const { isCommandPaletteOpen: open, setCommandPaletteOpen: setOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { activeHome } = useHome();

  // Toggle the menu when ⌘K or / is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  // Handle debounced search (simple approach with useQuery caching)
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["global-search", activeHome?.id, debouncedQuery],
    queryFn: async () => {
      if (!activeHome?.id || !debouncedQuery.trim()) return null;
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
        headers: { "x-home-id": activeHome.id }
      });
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!activeHome?.id && debouncedQuery.trim().length > 0,
  });

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Save to recent
  const saveRecent = (item: { id: string; title: string; type: string; url: string }) => {
    const recents = JSON.parse(localStorage.getItem("homehub_recents") || "[]");
    const updated = [item, ...recents.filter((r: { id: string }) => r.id !== item.id)].slice(0, 5);
    localStorage.setItem("homehub_recents", JSON.stringify(updated));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recents, setRecents] = useState<any[]>([]);
  useEffect(() => {
    if (open) {
      // Use setTimeout to bypass strict mode set-state-in-effect issues if it complains
      setTimeout(() => {
        setRecents(JSON.parse(localStorage.getItem("homehub_recents") || "[]"));
      }, 0);
    }
  }, [open]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (url: string, item?: any) => {
    if (item) saveRecent(item);
    runCommand(() => router.push(url));
  };

  // Ensure styles are injected manually since cmdk doesn't have default tailwind wrappers
  // We use standard tailwind classes but handle the Dialog overlay via fixed positioning.

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        [cmdk-dialog] {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          width: 100%;
          max-width: 640px;
          outline: none;
        }
        [cmdk-overlay] {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 999;
          animation: overlayShow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes overlayShow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        [cmdk-group-heading] {
          padding: 8px 16px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-muted-foreground);
        }
        [cmdk-item] {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          border-radius: 12px;
          margin: 4px 8px;
          transition: all 0.1s ease;
        }
        [cmdk-item][data-selected="true"] {
          background: var(--color-secondary);
          color: var(--color-foreground);
        }
        [cmdk-item][data-disabled="true"] {
          opacity: 0.5;
          pointer-events: none;
        }
      `}} />

      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen} 
        label="Global Command Palette"
        className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-float overflow-hidden flex flex-col"
      >
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Command.Input 
            value={query} 
            onValueChange={setQuery}
            autoFocus
            placeholder="Search HomeHub or type a command..." 
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none h-16 px-4 text-lg font-medium text-foreground placeholder:text-muted-foreground/50"
          />
          {isLoading && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />}
          <div className="flex items-center gap-1 ml-4 shrink-0">
             <kbd className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded border border-border/50">ESC</kbd>
          </div>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2 overscroll-contain">
          <Command.Empty className="py-12 text-center">
            {debouncedQuery.trim() ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">No matches were found in this Home.</p>
                <div className="flex justify-center gap-4 text-sm mt-4">
                  <button onClick={() => runCommand(() => router.push("/assets/create"))} className="text-primary hover:underline">Add Asset</button>
                  <button onClick={() => runCommand(() => router.push("/spaces/create"))} className="text-primary hover:underline">Create Space</button>
                  <button onClick={() => runCommand(() => router.push("/vault/upload"))} className="text-primary hover:underline">Upload Document</button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Type to search...</p>
            )}
          </Command.Empty>

          {!debouncedQuery.trim() && (
            <>
              {recents.length > 0 && (
                <Command.Group heading="Recent">
                  {recents.map((r, i) => (
                    <Command.Item key={`recent-${i}`} onSelect={() => handleSelect(r.url)}>
                      {r.type === "space" && <Folder className="w-4 h-4 text-muted-foreground" />}
                      {r.type === "asset" && <Package className="w-4 h-4 text-muted-foreground" />}
                      {r.type === "page" && <LayoutDashboard className="w-4 h-4 text-muted-foreground" />}
                      <span className="font-medium text-sm">{r.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group heading="Quick Actions">
                <Command.Item onSelect={() => handleSelect("/spaces/create")}>
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Create Space</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/assets/create")}>
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Add Asset</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/vault/upload")}>
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Upload Document</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/money/create")}>
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Log Expense</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/care/create")}>
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Schedule Maintenance</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Pages">
                <Command.Item onSelect={() => handleSelect("/home", { id: "p1", title: "Dashboard", type: "page", url: "/home" })}>
                  <HomeIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Dashboard</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/spaces", { id: "p2", title: "Spaces", type: "page", url: "/spaces" })}>
                  <Folder className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Spaces</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/assets", { id: "p3", title: "Assets", type: "page", url: "/assets" })}>
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Assets</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/vault", { id: "p4", title: "Vault", type: "page", url: "/vault" })}>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Vault</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/care", { id: "p5", title: "Care", type: "page", url: "/care" })}>
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Care</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/money", { id: "p6", title: "Money", type: "page", url: "/money" })}>
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Money</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/family", { id: "p7", title: "Family", type: "page", url: "/family" })}>
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Family</span>
                </Command.Item>
                <Command.Item onSelect={() => handleSelect("/settings", { id: "p8", title: "Settings", type: "page", url: "/settings" })}>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Settings</span>
                </Command.Item>
              </Command.Group>
            </>
          )}

          {results && (
            <>
              {results.spaces?.length > 0 && (
                <Command.Group heading="Spaces">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {results.spaces.map((space: any) => (
                    <Command.Item 
                      key={`space-${space.id}`} 
                      onSelect={() => handleSelect(`/spaces/${space.id}`, { id: space.id, title: space.name, type: "space", url: `/spaces/${space.id}` })}
                    >
                      <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight truncate">{space.name}</span>
                      </div>
                      {space._count && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-secondary px-2 py-0.5 rounded-full border border-primary/10">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground">Connected</span>
                          <span className="text-[10px] font-medium text-primary">{(space._count.assets || 0) + (space._count.documents || 0) + (space._count.maintenance || 0) + (space._count.expenses || 0)}</span>
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.assets?.length > 0 && (
                <Command.Group heading="Assets">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {results.assets.map((asset: any) => (
                    <Command.Item 
                      key={`asset-${asset.id}`} 
                      onSelect={() => handleSelect(`/assets/${asset.id}`, { id: asset.id, title: asset.name, type: "asset", url: `/assets/${asset.id}` })}
                    >
                      <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight truncate">{asset.name}</span>
                        {asset.space && <span className="text-[10px] text-muted-foreground truncate">{asset.space.name}</span>}
                      </div>
                      {asset._count && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-secondary px-2 py-0.5 rounded-full border border-primary/10">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground">Connected</span>
                          <span className="text-[10px] font-medium text-primary">{(asset._count.documents || 0) + (asset._count.maintenance || 0) + (asset._count.expenses || 0) + (asset.space ? 1 : 0)}</span>
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.maintenance?.length > 0 && (
                <Command.Group heading="Care">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {results.maintenance.map((m: any) => (
                    <Command.Item 
                      key={`maint-${m.id}`} 
                      onSelect={() => handleSelect(`/care/${m.id}`)}
                    >
                      <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight truncate">{m.title}</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {m.asset ? m.asset.name : (m.space ? m.space.name : "Home")}
                        </span>
                      </div>
                      {m._count && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-secondary px-2 py-0.5 rounded-full border border-primary/10">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground">Connected</span>
                          <span className="text-[10px] font-medium text-primary">{(m._count.documents || 0) + (m._count.expenses || 0) + (m.asset ? 1 : 0) + (m.space ? 1 : 0)}</span>
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.expenses?.length > 0 && (
                <Command.Group heading="Money">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {results.expenses.map((e: any) => (
                    <Command.Item 
                      key={`exp-${e.id}`} 
                      onSelect={() => handleSelect(`/money/${e.id}`)}
                    >
                      <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight truncate">{e.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate">${e.amount.toLocaleString()}</span>
                      </div>
                      {e._count && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-secondary px-2 py-0.5 rounded-full border border-primary/10">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground">Connected</span>
                          <span className="text-[10px] font-medium text-primary">{(e._count.documents || 0) + (e.asset ? 1 : 0) + (e.space ? 1 : 0)}</span>
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.documents?.length > 0 && (
                <Command.Group heading="Documents">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {results.documents.map((d: any) => (
                    <Command.Item 
                      key={`doc-${d.id}`} 
                      onSelect={() => handleSelect(`/vault/${d.id}`)}
                    >
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight">{d.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 bg-secondary px-2 py-0.5 rounded-full border border-primary/10">
                        <span className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground">Connected</span>
                        <span className="text-[10px] font-medium text-primary">{(d.asset ? 1 : 0) + (d.space ? 1 : 0)}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.members?.length > 0 && (
                <Command.Group heading="Members">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {results.members.map((m: any) => (
                    <Command.Item 
                      key={`mem-${m.id}`} 
                      onSelect={() => handleSelect(`/family/${m.id}`)}
                    >
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm leading-tight">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground">{m.email}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </>
          )}

        </Command.List>
      </Command.Dialog>
    </>
  );
}
