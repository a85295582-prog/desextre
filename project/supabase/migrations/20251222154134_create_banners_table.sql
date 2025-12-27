/*
  # Create Banners Table for Homepage Carousel

  1. New Tables
    - `banners`
      - `id` (uuid, primary key) - Unique identifier for each banner
      - `title` (text) - Banner title/heading
      - `description` (text) - Banner description or call-to-action text
      - `image_url` (text) - URL of the banner image
      - `link_url` (text, optional) - Optional link when banner is clicked
      - `category` (text, optional) - Optional category association
      - `order_position` (integer) - Display order of banners
      - `is_active` (boolean) - Whether banner is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `banners` table
    - Add policy for public read access to active banners
    - Add policies for authenticated users to manage banners

  3. Notes
    - Banners will be displayed in order_position sequence
    - Only active banners are shown to public users
    - Admins can create, update, and delete banners
*/

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  category text DEFAULT '',
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view active banners"
  ON banners
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert banners"
  ON banners
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update banners"
  ON banners
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete banners"
  ON banners
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_banners_active_position 
  ON banners(is_active, order_position);
