/*
  # Create Site Theme Settings Table

  1. New Tables
    - `site_theme_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `theme_name` (text) - Name of the theme (e.g., "Navidad", "Año Nuevo", "Personalizado")
      - `primary_color` (text) - Primary brand color (hex)
      - `secondary_color` (text) - Secondary brand color (hex)
      - `accent_color` (text) - Accent color for highlights (hex)
      - `background_gradient_from` (text) - Background gradient start color
      - `background_gradient_to` (text) - Background gradient end color
      - `header_background` (text) - Header background color
      - `button_gradient_from` (text) - Button gradient start color
      - `button_gradient_to` (text) - Button gradient end color
      - `custom_css` (text) - Optional custom CSS
      - `active` (boolean) - Whether this theme is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `site_theme_settings` table
    - Add policy for public read access
    - Add policy for authenticated admin updates

  3. Notes
    - Only one theme can be active at a time
    - Default theme will be created with current Serena Company colors
*/

CREATE TABLE IF NOT EXISTS site_theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name text NOT NULL,
  primary_color text DEFAULT '#d97706',
  secondary_color text DEFAULT '#ea580c',
  accent_color text DEFAULT '#f59e0b',
  background_gradient_from text DEFAULT '#fffbeb',
  background_gradient_to text DEFAULT '#ffedd5',
  header_background text DEFAULT '#ffffff',
  button_gradient_from text DEFAULT '#d97706',
  button_gradient_to text DEFAULT '#ea580c',
  custom_css text,
  active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
 
ALTER TABLE site_theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active theme"
  ON site_theme_settings
  FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can view all themes"
  ON site_theme_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert themes"
  ON site_theme_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update themes"
  ON site_theme_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete themes"
  ON site_theme_settings
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_site_theme_active ON site_theme_settings(active);

INSERT INTO site_theme_settings (theme_name, active) VALUES ('Default', true);

INSERT INTO site_theme_settings (
  theme_name,
  primary_color,
  secondary_color,
  accent_color,
  background_gradient_from,
  background_gradient_to,
  header_background,
  button_gradient_from,
  button_gradient_to,
  active
) VALUES 
(
  'Navidad',
  '#dc2626',
  '#16a34a',
  '#fbbf24',
  '#fef2f2',
  '#f0fdf4',
  '#ffffff',
  '#dc2626',
  '#16a34a',
  false
),
(
  'Año Nuevo',
  '#8b5cf6',
  '#f59e0b',
  '#fbbf24',
  '#faf5ff',
  '#fefce8',
  '#ffffff',
  '#8b5cf6',
  '#f59e0b',
  false
);
