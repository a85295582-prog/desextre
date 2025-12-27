/*
  # Create Promotional Sections Table

  1. New Tables
    - `promotional_sections`
      - `id` (uuid, primary key) - Unique identifier for each promotional section
      - `title` (text) - Title of the promotional section
      - `description` (text, optional) - Description text for the section
      - `image_url` (text) - URL of the promotional image
      - `link_url` (text, optional) - Optional link URL when clicking the image
      - `category` (text, optional) - Optional category to link to
      - `position` (text) - Where to display: 'top', 'middle', 'bottom', 'between_categories'
      - `order_position` (integer) - Order for sorting multiple sections
      - `is_active` (boolean) - Whether the section is currently active
      - `section_type` (text) - Type: 'full_width', 'half_width', 'grid_2', 'grid_3'
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `promotional_sections` table
    - Add policy for public read access to active sections
    - Add policy for authenticated users to manage sections
*/

CREATE TABLE IF NOT EXISTS promotional_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  link_url text,
  category text,
  position text NOT NULL DEFAULT 'between_categories',
  order_position integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  section_type text NOT NULL DEFAULT 'full_width',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE promotional_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotional sections"
  ON promotional_sections
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert promotional sections"
  ON promotional_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update promotional sections"
  ON promotional_sections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete promotional sections"
  ON promotional_sections
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_promotional_sections_position ON promotional_sections(position, order_position);
CREATE INDEX IF NOT EXISTS idx_promotional_sections_active ON promotional_sections(is_active);
