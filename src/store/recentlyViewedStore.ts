"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedStore {
  items: RecentItem[];
  addItem: (item: RecentItem) => void;
  clearItems: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== newItem.id);
          const updated = [{ ...newItem, viewedAt: Date.now() }, ...filtered];
          return { items: updated.slice(0, 10) }; // keep last 10
        }),

      clearItems: () => set({ items: [] }),
    }),
    {
      name: "little-bunnies-recently-viewed",
      skipHydration: true,
    }
  )
);
