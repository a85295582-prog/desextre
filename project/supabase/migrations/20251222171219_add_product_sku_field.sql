/*
  # Add SKU field to products table

  1. Changes
    - Add `sku` column to products table (text, optional, unique)
  
  2. Details
    - SKU: Store the internal product code or SKU (Stock Keeping Unit)
    - Field is optional and can be null
    - Must be unique to avoid duplicates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text UNIQUE;
  END IF;
END $$;