import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background pointer-events-none" />
      
      <div className="absolute top-8 left-8 z-10">
        <Link href="/" className="flex items-center gap-2 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">H</span>
          </div>
          HomeHub OS
        </Link>
      </div>
      
      <div className="w-full max-w-md px-6 z-10">
        {children}
      </div>
    </div>
  );
}
