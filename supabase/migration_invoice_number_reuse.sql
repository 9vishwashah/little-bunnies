-- =============================================
-- LITTLE BUNNIES — Reuse deleted invoice numbers
-- Replaces the sequence-based invoice numbering (which only ever counted
-- up, leaving a permanent gap whenever an order was deleted) with a
-- "smallest unused number" assignment — so deleting order #4 means the
-- next new order becomes #4 again instead of jumping to #5.
-- Run this once in the Supabase SQL editor (after migration_invoice_number.sql).
-- =============================================

CREATE OR REPLACE FUNCTION public.get_or_create_invoice_number(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_number INTEGER;
BEGIN
  -- Lock this order row so two concurrent calls for it can't both assign.
  PERFORM 1 FROM public.orders WHERE id = p_order_id FOR UPDATE;

  SELECT invoice_number INTO v_number FROM public.orders WHERE id = p_order_id;

  IF v_number IS NULL THEN
    -- Serializes number assignment across orders (not just this one row),
    -- so two orders paid at the same instant can't both compute the same
    -- "smallest gap" number and collide on the UNIQUE constraint.
    PERFORM pg_advisory_xact_lock(hashtext('invoice_number_assignment'));

    SELECT COALESCE(MIN(t.n), 1) INTO v_number
    FROM generate_series(1, (SELECT COALESCE(MAX(invoice_number), 0) FROM public.orders) + 1) AS t(n)
    WHERE NOT EXISTS (SELECT 1 FROM public.orders o WHERE o.invoice_number = t.n);

    UPDATE public.orders SET invoice_number = v_number WHERE id = p_order_id;
  END IF;

  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
