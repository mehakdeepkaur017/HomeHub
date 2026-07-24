"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { motion } from "framer-motion";
import { useHome } from "@/components/providers/home-provider";
import { useOnboarding } from "@/hooks/use-onboarding";
import { ModuleSkeleton } from "@/components/ui/module-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyAssetsIllustration } from "@/components/ui/illustrations";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PackageOpen, Search, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AssetCard } from "./components/asset-card";
import { Button } from "@/components/ui/button";

export default function AssetsPage() {
  const router = useRouter();
  const { activeHome } = useHome();
  const { completion } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets", activeHome?.id, searchQuery, activeCategory],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (activeCategory) params.append("category", activeCategory);
      
      const res = await fetch(`/api/assets?${params.toString()}`, {
        headers: { "x-home-id": activeHome.id }
      });
      if (!res.ok) throw new Error("Failed to fetch assets");
      return res.json();
    },
    enabled: !!activeHome?.id,
  });

  if (!activeHome || isLoading) {
    return <ModuleSkeleton type="bento" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = Array.from(new Set(assets?.map((a: any) => a.category) || []));

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10">
      <PageHeader
        title="My Assets"
        description="Everything your home owns, organized beautifully."
        actions={
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/assets/create" className="inline-flex items-center justify-center h-12 px-6 rounded-full font-medium bg-primary text-primary-foreground hover:scale-[0.98] transition-transform shadow-float">
              <Plus className="h-5 w-5 mr-2" />
              Add Asset
            </Link>
          </motion.div>
        }
      />

      {assets?.length === 0 && !searchQuery && !activeCategory ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EmptyState
            illustration={<EmptyAssetsIllustration />}
            title={!completion.isComplete ? "Your home has rooms." : "Your home has no objects yet."}
            description={!completion.isComplete ? "Now let's help it remember what lives inside them." : "Add appliances, furniture and important belongings to create their digital identity."}
            actionLabel="Add Asset"
            onAction={() => router.push("/assets/create")}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-md border border-border/50 p-4 rounded-3xl">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full h-12 pl-12 pr-4 bg-background border border-border/60 rounded-2xl text-sm focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-border transition-colors placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="rounded-full h-10 px-5 font-medium shrink-0"
              >
                All
              </Button>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categories.map((category: any) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="rounded-full h-10 px-5 font-medium shrink-0"
                >
                  {category}
                </Button>
              ))}
              <Button aria-label="Filter options" variant="ghost" size="icon" className="h-10 w-10 rounded-full shrink-0 border border-border/40 bg-background/50">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid */}
          {assets?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {assets.map((asset: any) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-lg font-serif text-muted-foreground">No assets found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearchQuery(""); setActiveCategory(null); }} className="mt-2 text-primary">
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
