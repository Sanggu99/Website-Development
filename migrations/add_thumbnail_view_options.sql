-- Add columns for thumbnail view customization
-- These columns store the position (pan) and scale (zoom) of the thumbnail image
-- as set in the Visual Editor.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_object_position text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_scale numeric DEFAULT 1.0;

-- Ensure existing rows have a sensible default for scale
UPDATE public.projects SET thumbnail_scale = 1.0 WHERE thumbnail_scale IS NULL;
