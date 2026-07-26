"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const getItemKey = (id: string, variantId?: string) =>
  variantId ? `${id}-${variantId}` : id;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const key = getItemKey(newItem.id, newItem.variant?.id);
          const existing = state.items.find(
            (item) =>
              getItemKey(item.id, item.variant?.id) === key
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                getItemKey(item.id, item.variant?.id) === key
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id, variantId) => {
        const key = getItemKey(id, variantId);
        set((state) => ({
          items: state.items.filter(
            (item) => getItemKey(item.id, item.variant?.id) !== key
          ),
        }));
      },

      updateQuantity: (id, quantity, variantId) => {
        const key = getItemKey(id, variantId);
        if (quantity <= 0) {
          get().removeItem(id, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            getItemKey(item.id, item.variant?.id) === key
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const itemPrice =
            item.price + (item.variant?.price_modifier || 0);
          return sum + itemPrice * item.quantity;
        }, 0),
    }),
    {
      name: "little-bunnies-cart",
      skipHydration: true,
    }
  )
);
