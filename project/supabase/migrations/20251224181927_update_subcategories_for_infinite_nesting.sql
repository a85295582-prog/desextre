/*
  # Update Subcategories for Infinite Nesting

  ## Overview
  This migration updates the subcategories table to support infinite nesting by adding a parent_id column,
  allowing subcategories to have other subcategories as parents instead of only categories.

  ## Changes

  ### 1. New Columns
  - `parent_id` (uuid, nullable) - References another subcategory as parent
  - `level` (integer, default 0) - Depth level in the hierarchy (0 = direct child of category)

  ### 2. Modified Columns
  - `category_id` remains but becomes optional for deeper nested subcategories
  
  ### 3. New Foreign Key
  - `subcategories_parent_id_fkey` - Links to parent subcategory

  ### 4. New Indexes
  - Index on parent_id for faster hierarchical queries
  - Index on category_id and level for efficient filtering

  ### 5. Migration Logic
  - Existing subcategories remain unchanged (level 0, no parent_id)
  - New subcategories can reference either category_id or parent_id

  ## Security
  - RLS policies remain unchanged
  - Authenticated users can manage subcategories
  - Public can view active subcategories
*/

-- Add new columns to support infinite nesting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subcategories' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE subcategories ADD COLUMN parent_id uuid REFERENCES subcategories(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subcategories' AND column_name = 'level'
  ) THEN
    ALTER TABLE subcategories ADD COLUMN level integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subcategories_parent_id ON subcategories(parent_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_level ON subcategories(category_id, level);

-- Update existing rows to have level 0 if not set
UPDATE subcategories SET level = 0 WHERE level IS NULL;

-- Add check constraint to ensure either category_id or parent_id is set (but not necessarily both for root level)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subcategories_parent_check'
  ) THEN
    ALTER TABLE subcategories 
    ADD CONSTRAINT subcategories_parent_check 
    CHECK (
      (category_id IS NOT NULL AND parent_id IS NULL AND level = 0) OR
      (parent_id IS NOT NULL AND level > 0)
    );
  END IF;
END $$;