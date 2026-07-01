"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";

export default function ClearCartOnMount() {
  const clearCart = useCartStore((state) => state.clearCart);
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [clearCart]);

  return null;
}
