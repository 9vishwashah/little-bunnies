"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // product ids
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (id) =>
        set((state) =>
          state.items.includes(id) ? state : { items: [...state.items, id] }
        ),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i !== id) })),

      toggleItem: (id) => {
        const { isWishlisted, addItem, removeItem } = get();
        if (isWishlisted(id)) {
          removeItem(id);
        } else {
          addItem(id);
        }
      },

      isWishlisted: (id) => get().items.includes(id),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "little-bunnies-wishlist",
      skipHydration: true,
    }
  )
);
