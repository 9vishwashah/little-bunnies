-- =============================================
-- LITTLE BUNNIES — Product Videos
-- Adds "Assembly Video" and "Features Video" containers
-- to the product gallery (shown after the image slides).
-- Run this once in the Supabase SQL editor.
-- =============================================

-- =============================================
-- PRODUCT VIDEOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('assembly', 'features')),
  url TEXT NOT NULL,
  thumbnail_url TEXT, -- poster image shown before the video is played (fast paint)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, type)
);

CREATE INDEX IF NOT EXISTS idx_product_videos_product ON public.product_videos(product_id);

ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view product videos" ON public.product_videos;
CREATE POLICY "Public can view product videos" ON public.product_videos FOR SELECT USING (TRUE);

DROP TRIGGER IF EXISTS update_product_videos_updated_at ON public.product_videos;
CREATE TRIGGER update_product_videos_updated_at
  BEFORE UPDATE ON public.product_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- STORAGE: allow video uploads in the existing "products" bucket
-- (admin uploads go through /api/upload, which already targets this bucket)
-- Only widens the mime-type allow-list if one was already set — if the
-- bucket has no restriction (NULL = allow all), it is left untouched.
-- =============================================
UPDATE storage.buckets
SET file_size_limit = 104857600 -- 100MB, up from the default
WHERE id = 'products' AND (file_size_limit IS NULL OR file_size_limit < 104857600);

UPDATE storage.buckets
SET allowed_mime_types = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      allowed_mime_types || ARRAY['video/mp4', 'video/webm', 'video/quicktime']
    )
  )
)
WHERE id = 'products' AND allowed_mime_types IS NOT NULL;
