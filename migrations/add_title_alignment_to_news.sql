-- Migration: Add title_alignment column to news table
-- Execute this SQL in your Supabase SQL Editor (Project Settings > SQL Editor)

-- Step 1: Add the column with default value
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS title_alignment TEXT DEFAULT 'justify';

-- Step 2: Add constraint to ensure valid values only
ALTER TABLE news
ADD CONSTRAINT title_alignment_check 
CHECK (title_alignment IN ('left', 'center', 'right', 'justify'));

-- Step 3: Update any NULL values to default (safety measure)
UPDATE news 
SET title_alignment = 'justify' 
WHERE title_alignment IS NULL;

-- Step 4: Verify the migration
SELECT id, title, title_alignment 
FROM news 
ORDER BY id 
LIMIT 5;
