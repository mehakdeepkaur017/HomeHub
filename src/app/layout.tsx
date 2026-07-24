import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F9F7" },
    { media: "(prefers-color-scheme: dark)", color: "#282420" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "HOMEHUB OS | The Operating System for Modern Homes",
    template: "%s | HOMEHUB OS",
  },
  description: "A premium, calm, and timeless operating system for managing your home. Organize spaces, track assets, store documents, and schedule maintenance effortlessly.",
  applicationName: "HomeHub OS",
  appleWebApp: {
    capable: true,
    title: "HomeHub",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "HomeHub OS",
    title: "HOMEHUB OS | The Operating System for Modern Homes",
    description: "A premium, calm, and timeless operating system for managing your home.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOMEHUB OS",
    description: "The Operating System for Modern Homes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.className} ${fraunces.variable} ${manrope.variable} antialiased selection:bg-primary/20 selection:text-primary`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
