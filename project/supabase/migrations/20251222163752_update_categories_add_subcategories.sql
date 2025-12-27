/*
  # Update Categories and Add Subcategories System

  1. Updates to Existing Tables
    - `categories` - Add missing columns
      - `icon` (text) - Icon identifier for the category
      - `order_position` (integer) - Display order
      - `is_active` (boolean) - Whether category is active
      - `updated_at` (timestamptz) - Last update timestamp

  2. New Tables
    - `subcategories`
      - `id` (uuid, primary key) - Unique identifier for each subcategory
      - `category_id` (uuid, foreign key) - Reference to parent category
      - `name` (text) - Subcategory name
      - `order_position` (integer) - Display order within category
      - `is_active` (boolean) - Whether subcategory is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  3. Changes to Products Table
    - Add `subcategory_id` to products table
    - Maintain `category` field for backwards compatibility

  4. Security
    - Enable RLS on subcategories table
    - Public can read active subcategories
    - Authenticated users can manage subcategories

  5. Notes
    - Categories can have multiple subcategories
    - Products can belong to one category and one subcategory
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE categories ADD COLUMN icon text DEFAULT 'Package';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'order_position'
  ) THEN
    ALTER TABLE categories ADD COLUMN order_position integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE categories ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE categories ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products ADD COLUMN subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view active subcategories" ON subcategories;
CREATE POLICY "Public users can view active subcategories"
  ON subcategories
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can insert subcategories" ON subcategories;
CREATE POLICY "Authenticated users can insert subcategories"
  ON subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update subcategories" ON subcategories;
CREATE POLICY "Authenticated users can update subcategories"
  ON subcategories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete subcategories" ON subcategories;
CREATE POLICY "Authenticated users can delete subcategories"
  ON subcategories
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_categories_active_position 
  ON categories(is_active, order_position);

CREATE INDEX IF NOT EXISTS idx_subcategories_category 
  ON subcategories(category_id, order_position);

CREATE INDEX IF NOT EXISTS idx_products_subcategory 
  ON products(subcategory_id);
