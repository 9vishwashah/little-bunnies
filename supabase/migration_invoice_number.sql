-- =============================================
-- LITTLE BUNNIES — Sequential Invoice Numbering
-- Adds a separate, sequential invoice_number (1, 2, 3, ...) to orders,
-- shown on the receipt PDF as "LB001", "LB002", etc. This is distinct
-- from order_number (the existing LB+date+random reference used for
-- customer support / lookups) — that format and column are untouched.
-- Numbers are assigned lazily, the first time an order's invoice is
-- actually generated, via get_or_create_invoice_number() below, so the
-- sequence reflects invoice-issue order rather than order-creation order.
-- Run this once in the Supabase SQL editor.
-- =============================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_number INTEGER UNIQUE;

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1;

-- Atomically assigns the next sequence value the first time it's called
-- for a given order, and simply returns the existing one on later calls
-- (e.g. re-downloading the same receipt), so numbers never skip or repeat.
CREATE OR REPLACE FUNCTION public.get_or_create_invoice_number(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_number INTEGER;
BEGIN
  SELECT invoice_number INTO v_number FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_number IS NULL THEN
    v_number := nextval('public.invoice_number_seq');
    UPDATE public.orders SET invoice_number = v_number WHERE id = p_order_id;
  END IF;

  RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
