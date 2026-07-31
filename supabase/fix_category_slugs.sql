    -- =============================================
    -- LITTLE BUNNIES — Category Slug Diagnostic & Fix
    -- Run this in Supabase Dashboard → SQL Editor
    -- =============================================

    -- STEP 1: See all your categories and their slugs
    SELECT id, name, slug, is_active, sort_order
    FROM public.categories
    ORDER BY sort_order;

    -- STEP 2: See how many products are in each category
    SELECT c.name AS category_name, c.slug, c.sort_order, COUNT(p.id) AS product_count
    FROM public.categories c
    LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = TRUE
    GROUP BY c.name, c.slug, c.sort_order
    ORDER BY c.sort_order;

    -- =============================================
    -- STEP 3: If the "Diaper Bags" category slug is NOT "diaper-bags",
    -- update it to "diaper-bags" so the frontend works correctly.
    -- Replace 'YOUR_CURRENT_DIAPER_BAGS_SLUG' with what you see in Step 1.
    -- Example: if it shows slug = 'diapers', run:
    -- =============================================

    -- UPDATE public.categories
    -- SET slug = 'diaper-bags'
    -- WHERE slug = 'diapers';

    -- =============================================
    -- STEP 4: If the "Utility Bags" category slug is NOT "utility-bags",
    -- update it similarly. Example:
    -- =============================================

    -- UPDATE public.categories
    -- SET slug = 'utility-bags'
    -- WHERE slug = 'bags';

    -- =============================================
    -- STEP 5 (Alternative): If you want to keep your existing slugs
    -- and NOT change the database, let me know the slugs from Step 1
    -- and I will update the frontend code to match instead.
    -- =============================================
