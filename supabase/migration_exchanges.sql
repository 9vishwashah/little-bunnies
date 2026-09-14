-- Exchange & Credit Note flow — see src/app/(shop)/exchange-policy/page.tsx
-- for the policy this implements, and the "exchange-request" chat thread for
-- the design (guest/no-login flow: order number + phone/email lookup).
--
-- Full schema for all phases is created here in one migration (Phase 1 code
-- only uses delivered_at / is_clearance_sale / exchange_requests intake
-- fields — the payment/credit-note columns are ready for later phases so
-- this file doesn't need to be re-run per phase).

-- ── Orders: real delivery timestamp (the 15-day clock runs from this, not
--    created_at) — stamped by the admin PATCH route the first time status
--    moves to 'delivered', never overwritten after that. ──────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- ── Products: Flash Sale / Clearance items are excluded from exchange
--    eligibility per policy. ────────────────────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_clearance_sale BOOLEAN NOT NULL DEFAULT false;

-- ── Credit notes: modeled as personal, single-use, expiring coupon-like
--    codes rather than an account balance, since checkout has no login
--    requirement — redeemed the same way a coupon code is. ───────────────
CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_order_id UUID REFERENCES public.orders(id),
  redeemed_at TIMESTAMPTZ,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_code ON public.credit_notes(code);

-- ── Exchange requests: one row per (order_item, request). Contact
--    phone/email is stored on the row itself (not just looked up via the
--    order) so the public status-check form can re-verify ownership
--    without needing an account. ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exchange_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested', 'approved', 'rejected',
    'pickup_fee_pending', 'pickup_scheduled', 'picked_up', 'received',
    'qc_passed', 'qc_failed', 'resolved', 'cancelled'
  )),
  reason TEXT NOT NULL,
  unboxing_video_url TEXT NOT NULL,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Later phases (replacement selection / payments / credit) —
  -- nullable/unused until Phase 2+.
  resolution_type TEXT CHECK (resolution_type IN ('replacement', 'credit_note')),
  replacement_product_id UUID REFERENCES public.products(id),
  replacement_variant_id UUID,
  price_difference NUMERIC(10,2),
  pickup_fee_amount NUMERIC(10,2) NOT NULL DEFAULT 200,
  pickup_fee_status TEXT NOT NULL DEFAULT 'not_required' CHECK (pickup_fee_status IN ('not_required', 'pending', 'paid')),
  pickup_fee_ablepay_transaction_id TEXT,
  difference_payment_status TEXT NOT NULL DEFAULT 'not_required' CHECK (difference_payment_status IN ('not_required', 'pending', 'paid')),
  difference_ablepay_transaction_id TEXT,
  credit_note_id UUID REFERENCES public.credit_notes(id),

  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exchange_requests_order_id ON public.exchange_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_order_item_id ON public.exchange_requests(order_item_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON public.exchange_requests(status);

-- ── RLS: all access to these two tables goes through the service-role
--    client (createAdminClient) from server routes, same pattern as
--    orders/order_items — never queried directly from the browser. ───────
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.exchange_requests FOR ALL USING (false);
CREATE POLICY "Service role only" ON public.credit_notes FOR ALL USING (false);
