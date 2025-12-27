/*
  # Crear tabla de marcas y soporte para múltiples imágenes

  1. Nueva Tabla: brands
    - `id` (uuid, primary key)
    - `name` (text, unique) - Nombre de la marca
    - `logo_url` (text, nullable) - URL del logo de la marca
    - `description` (text, nullable) - Descripción de la marca
    - `is_active` (boolean, default true) - Si la marca está activa
    - `order_position` (integer, default 0) - Orden de visualización
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Cambios en products:
    - Agregar `image_urls` (jsonb) - Array de URLs de imágenes
    - Mantener `image_url` para compatibilidad

  3. Seguridad:
    - Habilitar RLS en brands
    - Políticas de lectura pública
    - Políticas de escritura solo para autenticados

  4. Storage:
    - Crear bucket para logos de marcas
*/

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo_url text,
  description text,
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are viewable by everyone"
  ON brands FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert brands"
  ON brands FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update brands"
  ON brands FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete brands"
  ON brands FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_order ON brands(order_position);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE products ADD COLUMN image_urls jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_image_urls ON products USING gin(image_urls);

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Brand logos are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated users can upload brand logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated users can update brand logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'brand-logos')
  WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Authenticated users can delete brand logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'brand-logos');
