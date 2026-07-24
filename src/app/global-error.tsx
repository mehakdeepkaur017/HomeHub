"use client";

import { Fraunces, Manrope } from "next/font/google";
import { AlertTriangle, RefreshCw } from "lucide-react";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${manrope.className} ${fraunces.variable} ${manrope.variable}`}>
      <body className="antialiased selection:bg-primary/20 selection:text-primary">
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
             <div className="mx-auto h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10" />
             </div>
             
             <h1 className="text-3xl font-serif text-foreground mb-4">Critical System Error</h1>
             <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
               HomeHub encountered a critical issue at the root level.
             </p>
             
             <button
               onClick={() => reset()}
               className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
             >
               <RefreshCw className="h-4 w-4" />
               Restart Application
             </button>
             
             {process.env.NODE_ENV === "development" && (
                <div className="mt-8 p-4 bg-secondary/50 rounded-xl text-left overflow-auto text-xs text-muted-foreground font-mono">
                  {error.message}
                </div>
             )}
          </div>
        </div>
      </body>
    </html>
  );
}
