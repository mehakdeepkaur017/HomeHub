import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { HomeProvider } from "@/components/providers/home-provider";
import { CommandPalette } from "@/components/ui/command-palette";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HomeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <CommandPalette />
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <TopNav />
          <main className="flex-1 overflow-y-auto bg-secondary/5">
            {children}
          </main>
        </div>
      </div>
    </HomeProvider>
  );
}
