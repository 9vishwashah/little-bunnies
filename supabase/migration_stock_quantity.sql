-- =============================================
-- LITTLE BUNNIES — Stock Quantity Migration
-- =============================================
-- Adds proper per-variant stock quantity support.
-- The inventory table already exists; this migration:
--   1. Ensures indexes exist for fast lookups
--   2. Adds a decrement_stock() function called after successful orders
--   3. Ensures the service role can update inventory rows

-- Fast lookup by variant_id (nullable FK)
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON public.inventory(variant_id);

-- =============================================
-- FUNCTION: decrement_stock(p_order_id UUID)
-- Decrements inventory.quantity for every item
-- in the given order. Clamps quantity at 0.
-- Also auto-sets products.in_stock = false when
-- a product's total available stock reaches 0.
-- =============================================
CREATE OR REPLACE FUNCTION decrement_stock(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  item RECORD;
  remaining INT;
BEGIN
  FOR item IN
    SELECT product_id, variant_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    -- Decrement inventory matching product + variant (variant_id may be NULL)
    UPDATE public.inventory
    SET quantity = GREATEST(0, quantity - item.quantity),
        updated_at = NOW()
    WHERE product_id = item.product_id
      AND (
        (item.variant_id IS NULL AND variant_id IS NULL)
        OR variant_id = item.variant_id
      );

    -- Check if total available stock for this product is now 0
    SELECT COALESCE(SUM(quantity), 0) INTO remaining
    FROM public.inventory
    WHERE product_id = item.product_id;

    IF remaining = 0 THEN
      UPDATE public.products
      SET in_stock = FALSE, updated_at = NOW()
      WHERE id = item.product_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow the function to be called via RPC
GRANT EXECUTE ON FUNCTION decrement_stock(UUID) TO service_role;
