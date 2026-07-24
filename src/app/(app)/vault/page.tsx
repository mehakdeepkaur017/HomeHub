"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Shield, Search, FileText, ShieldAlert } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ModuleSkeleton } from "@/components/ui/module-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyVaultIllustration } from "@/components/ui/illustrations";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card } from "@/components/ui/card";
import { useHome } from "@/components/providers/home-provider";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useQuery } from "@tanstack/react-query";
import { DocumentCard } from "./components/document-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SMART_CATEGORIES = [
  "Property", "Identity", "Insurance", "Bills", 
  "Warranty", "Manuals", "Medical", "Education", 
  "Finance", "Legal", "Other"
];

export default function VaultPage() {
  const { activeHome } = useHome();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { completion } = useOnboarding();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", activeHome?.id, searchQuery, activeCategory],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      let url = "/api/documents?";
      if (searchQuery) url += `q=${encodeURIComponent(searchQuery)}&`;
      if (activeCategory) url += `category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(url, { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  // Derived sections
  const recentDocuments = documents?.slice(0, 8) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expiringDocuments = documents?.filter((d: any) => {
    if (!d.expiryDate) return false;
    const expiry = new Date(d.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10"
    >
      <PageHeader
        title="Digital Vault."
        description="The memory system of your home. Secure, connected, and intelligent."
        actions={
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
              <input 
                type="text" 
                placeholder="Search title, category, tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-background border border-border/60 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm hover:border-border placeholder:text-muted-foreground"
              />
            </div>
            <Button onClick={() => router.push("/vault/upload")} className="h-12 rounded-2xl px-6 shadow-sm hidden sm:flex">
              Upload Document
            </Button>
          </div>
        }
      />

      {documents?.length === 0 && !searchQuery && !activeCategory ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EmptyState
            illustration={<EmptyVaultIllustration />}
            title="The Vault is secure but empty."
            description="Upload warranties, receipts, manuals, and important home documents to keep them safe and organized."
            actionLabel="Upload Document"
            onAction={() => router.push("/vault/upload")}
          />
        </motion.div>
      ) : (
        <div className="space-y-16">
          
          {/* Smart Categories */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
               <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Smart Categories</h2>
               {activeCategory && (
                 <button onClick={() => setActiveCategory(null)} className="text-xs font-medium text-primary">Clear Filter</button>
               )}
             </div>
             <div className="flex flex-wrap gap-3">
               {SMART_CATEGORIES.map(category => {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const count = documents?.filter((d: any) => d.category === category).length || 0;
                 const isActive = activeCategory === category;
                 return (
                   <button
                     key={category}
                     onClick={() => setActiveCategory(isActive ? null : category)}
                     className={cn(
                       "px-5 py-3 rounded-2xl border transition-all duration-300 text-sm font-medium flex items-center gap-2",
                       isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-card border-border/50 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                     )}
                   >
                     {category} 
                     <span className={cn(
                       "text-[10px] py-0.5 px-2 rounded-full",
                       isActive ? "bg-black/20 text-white" : "bg-secondary text-muted-foreground"
                     )}>
                       {count}
                     </span>
                   </button>
                 );
               })}
             </div>
          </section>

          {/* Expiring Documents (if any) */}
          {expiringDocuments.length > 0 && !activeCategory && !searchQuery && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert className="h-4 w-4" />
                <h2 className="text-sm font-bold tracking-widest uppercase">Action Required</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {expiringDocuments.map((doc: any) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </section>
          )}

          {/* Recent/Filtered Documents */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
               <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                 {searchQuery ? "Search Results" : activeCategory ? `${activeCategory} Documents` : "Recent Documents"}
               </h2>
             </div>
             
             {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                   <p className="text-sm">Accessing memory...</p>
                </div>
             ) : documents?.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2 border-2 border-dashed border-border/60 rounded-3xl bg-secondary/10">
                  <FileText className="h-8 w-8 opacity-20 mb-2" />
                  <p className="font-medium">No documents found.</p>
                  <p className="text-sm opacity-60">Try adjusting your search or category filter.</p>
                </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {(searchQuery || activeCategory ? documents : recentDocuments)?.map((doc: any) => (
                   <DocumentCard key={doc.id} document={doc} />
                 ))}
               </div>
             )}
          </section>

        </div>
      )}
      
      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Button onClick={() => router.push("/vault/upload")} size="icon" className="h-14 w-14 rounded-full shadow-float bg-primary text-primary-foreground">
          <FileText className="h-6 w-6" />
        </Button>
      </div>
    </motion.div>
  );
}
