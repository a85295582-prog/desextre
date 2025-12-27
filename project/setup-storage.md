# Configuración del Almacenamiento de Imágenes

El bucket de almacenamiento necesita ser configurado en Supabase para que las imágenes funcionen correctamente.

## Opción 1: Configuración Automática desde el Dashboard de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a la sección **Storage**
3. Crea un nuevo bucket llamado `products`
4. Marca el bucket como **Public**
5. Ve a **Policies** en el bucket
6. Agrega las siguientes políticas:

### Política de Lectura Pública
- **Policy name**: Public Access to Product Images
- **Allowed operation**: SELECT
- **Target roles**: public
- **Policy definition**: `bucket_id = 'products'`

### Política de Inserción para Usuarios Autenticados
- **Policy name**: Authenticated users can upload
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**: `bucket_id = 'products'`

### Política de Actualización para Usuarios Autenticados
- **Policy name**: Authenticated users can update
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'products'`
- **WITH CHECK expression**: `bucket_id = 'products'`

### Política de Eliminación para Usuarios Autenticados
- **Policy name**: Authenticated users can delete
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**: `bucket_id = 'products'`

## Opción 2: Ejecutar SQL Directamente

Si prefieres, puedes ejecutar este SQL directamente en el **SQL Editor** de Supabase:

```sql
-- Crear el bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id)
DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política: Acceso público para ver imágenes
CREATE POLICY "Public Access to Product Images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'products');

-- Política: Usuarios autenticados pueden subir
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Política: Usuarios autenticados pueden actualizar
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products')
  WITH CHECK (bucket_id = 'products');

-- Política: Usuarios autenticados pueden eliminar
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');
```

## Verificación

Después de configurar el bucket, las imágenes deberían cargarse y mostrarse correctamente en tu tienda.
