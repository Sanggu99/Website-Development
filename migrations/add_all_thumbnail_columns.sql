-- Add ALL thumbnail related columns to the projects table

-- 1. Thumbnail Image URL
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_image text;

-- 2. Thumbnail Aspect Ratio
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_aspect_ratio numeric;

-- 3. Thumbnail Object Position (Pan)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_object_position text;

-- 4. Thumbnail Scale (Zoom)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_scale numeric DEFAULT 1.0;

-- Ensure existing rows have a sensible default for scale
UPDATE public.projects SET thumbnail_scale = 1.0 WHERE thumbnail_scale IS NULL;
