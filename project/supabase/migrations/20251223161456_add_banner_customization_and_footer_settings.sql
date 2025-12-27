/*
  # Add Banner Customization and Footer Settings

  1. Changes to Banners Table
    - Add `show_title` (boolean) - Controls whether to display the banner title
    - Add `show_shadow` (boolean) - Controls whether to show shadow overlay on banner
    - Both default to true for backward compatibility

  2. New Tables
    - `footer_settings`
      - `id` (uuid, primary key)
      - `company_name` (text) - Company name to display in footer
      - `company_description` (text) - Short company description
      - `address` (text) - Physical address
      - `phone` (text) - Contact phone
      - `email` (text) - Contact email
      - `facebook_url` (text) - Facebook page URL
      - `instagram_url` (text) - Instagram profile URL
      - `twitter_url` (text) - Twitter profile URL
      - `whatsapp_number` (text) - WhatsApp contact number
      - `copyright_text` (text) - Copyright text to display
      - `updated_at` (timestamptz) - Last update timestamp

  3. Security
    - Enable RLS on `footer_settings` table
    - Add policy for public read access
    - Add policy for authenticated admin update access
*/

-- Add customization columns to banners table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'show_title'
  ) THEN
    ALTER TABLE banners ADD COLUMN show_title boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banners' AND column_name = 'show_shadow'
  ) THEN
    ALTER TABLE banners ADD COLUMN show_shadow boolean DEFAULT true;
  END IF;
END $$;

-- Create footer_settings table
CREATE TABLE IF NOT EXISTS footer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '',
  company_description text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  facebook_url text DEFAULT '',
  instagram_url text DEFAULT '',
  twitter_url text DEFAULT '',
  whatsapp_number text DEFAULT '',
  copyright_text text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on footer_settings
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to footer settings
CREATE POLICY "Anyone can read footer settings"
  ON footer_settings FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to update footer settings
CREATE POLICY "Authenticated users can update footer settings"
  ON footer_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default footer settings if table is empty
INSERT INTO footer_settings (
  company_name,
  company_description,
  copyright_text
)
SELECT 
  'Tu Empresa',
  'Descripción de tu empresa',
  '© 2024 Tu Empresa. Todos los derechos reservados.'
WHERE NOT EXISTS (SELECT 1 FROM footer_settings);
