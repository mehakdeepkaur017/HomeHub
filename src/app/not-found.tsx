import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center mb-8 shadow-sm border border-border/50">
          <Compass className="h-10 w-10 text-primary/70" />
        </div>
        
        <h1 className="text-8xl font-serif text-primary tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl font-serif text-foreground mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-10 leading-relaxed text-sm">
          It looks like you&apos;ve wandered into an uncharted part of your home. 
          Let&apos;s get you back to familiar spaces.
        </p>
        
        <Link href="/">
          <Button size="lg" className="rounded-full px-8 shadow-sm group">
            <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
          HomeHub OS • Safety Protocol
        </p>
      </div>
    </div>
  );
}
