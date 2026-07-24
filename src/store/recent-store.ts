import { create } from "zustand";
import { persist } from "zustand/middleware";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LucideIcon } from "lucide-react";

export type RecentItem = {
  id: string;
  title: string;
  type: "space" | "asset" | "document" | "maintenance" | "expense" | "member" | "page";
  url: string;
};

interface RecentStore {
  recents: RecentItem[];
  addRecent: (item: RecentItem) => void;
  clearRecents: () => void;
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      recents: [],
      addRecent: (item) =>
        set((state) => {
          // Remove duplicates and prepend
          const filtered = state.recents.filter((r) => r.id !== item.id && r.url !== item.url);
          return { recents: [item, ...filtered].slice(0, 5) };
        }),
      clearRecents: () => set({ recents: [] }),
    }),
    {
      name: "homehub_recents", // match existing local storage key
    }
  )
);
