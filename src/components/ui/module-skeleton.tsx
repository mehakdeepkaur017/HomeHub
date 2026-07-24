// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ModuleSkeleton({ type = "grid" }: { type?: "grid" | "bento" | "list" | "dashboard" }) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10 animate-pulse">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between relative z-10 mb-12">
        <div className="space-y-4 max-w-3xl w-full">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-16 w-3/4 rounded-2xl" />
          <Skeleton className="h-6 w-1/2 rounded-xl mt-4" />
        </div>
        <Skeleton className="h-12 w-32 rounded-full shrink-0" />
      </div>

      {type === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      )}

      {type === "bento" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[400px] md:col-span-2 lg:col-span-2 rounded-[2.5rem]" />
          <Skeleton className="h-[400px] md:col-span-1 lg:col-span-1 rounded-[2.5rem]" />
          <Skeleton className="h-[400px] md:col-span-3 lg:col-span-1 rounded-[2.5rem]" />
          
          <Skeleton className="h-[300px] md:col-span-1 lg:col-span-1 rounded-[2.5rem]" />
          <Skeleton className="h-[300px] md:col-span-2 lg:col-span-2 rounded-[2.5rem]" />
          <Skeleton className="h-[300px] md:col-span-3 lg:col-span-1 rounded-[2.5rem]" />
        </div>
      )}

      {type === "list" && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-3xl border border-border/50">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      )}

      {type === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 space-y-16">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-[500px] w-full rounded-3xl" />
          </div>
          <div className="lg:col-span-5 space-y-12">
            <Skeleton className="h-[400px] w-full rounded-[3rem]" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      )}
    </div>
  );
}
