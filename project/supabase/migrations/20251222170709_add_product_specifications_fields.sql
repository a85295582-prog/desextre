/*
  # Add product specification fields

  1. Changes
    - Add `brand` column to products table (text, optional)
    - Add `dimensions` column to products table (text, optional)
    - Add `compatibility` column to products table (text, optional)
  
  2. Details
    - Brand: Store the manufacturer or brand name of the product
    - Dimensions: Store product size/measurements (e.g., "10cm x 5cm x 3cm")
    - Compatibility: Store compatibility information (e.g., "Compatible with Model X, Y, Z")
    - All fields are optional and can be null
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE products ADD COLUMN brand text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'dimensions'
  ) THEN
    ALTER TABLE products ADD COLUMN dimensions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'compatibility'
  ) THEN
    ALTER TABLE products ADD COLUMN compatibility text;
  END IF;
END $$;