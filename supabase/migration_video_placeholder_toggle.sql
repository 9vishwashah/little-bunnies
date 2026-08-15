-- =============================================
-- LITTLE BUNNIES — Product Video Placeholder Toggle
-- Some products (e.g. diaper bags, utility bags) have no Assembly/Features
-- video and never will — showing empty "coming soon" video slide
-- containers for them doesn't make sense. This adds a per-product toggle
-- so the admin can turn those empty placeholder slides off. Products with
-- an actual video uploaded always show it regardless of this setting.
-- Run this once in the Supabase SQL editor.
-- =============================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_video_placeholders BOOLEAN NOT NULL DEFAULT TRUE;
