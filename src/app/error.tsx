"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("HomeHub Exception:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-card border border-destructive/20 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive/80" />
        
        <div className="mx-auto h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-serif text-foreground mb-3">Something went wrong</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          We encountered an unexpected error while preparing this view. 
          This has been logged, but you can try refreshing the page.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            onClick={reset} 
            variant="default"
            className="w-full sm:w-auto rounded-full group"
          >
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Try again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-full">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-secondary/50 rounded-xl text-left overflow-auto text-xs text-muted-foreground font-mono">
            <p className="font-bold mb-2 text-foreground">Developer Error Details:</p>
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
