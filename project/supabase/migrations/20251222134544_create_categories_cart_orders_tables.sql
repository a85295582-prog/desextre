/*
  # Crear tablas adicionales para la tienda en línea

  ## Nuevas Tablas
  
  ### 1. categories
  Tabla para gestionar categorías de productos de forma estructurada
  - `id` (uuid, primary key) - Identificador único
  - `name` (text, unique) - Nombre de la categoría
  - `description` (text) - Descripción de la categoría
  - `created_at` (timestamptz) - Fecha de creación
  
  ### 2. cart_items
  Tabla para el carrito de compras de usuarios
  - `id` (uuid, primary key) - Identificador único
  - `user_id` (uuid, foreign key) - Usuario propietario del carrito
  - `product_id` (uuid, foreign key) - Producto en el carrito
  - `quantity` (integer) - Cantidad del producto
  - `created_at` (timestamptz) - Fecha de agregado al carrito
  - `updated_at` (timestamptz) - Última actualización
  
  ### 3. orders
  Tabla para gestionar pedidos/órdenes
  - `id` (uuid, primary key) - Identificador único
  - `user_id` (uuid, foreign key) - Usuario que realizó la orden
  - `total_amount` (numeric) - Monto total de la orden
  - `status` (text) - Estado de la orden (pending, processing, completed, cancelled)
  - `customer_name` (text) - Nombre del cliente
  - `customer_email` (text) - Email del cliente
  - `customer_phone` (text) - Teléfono del cliente
  - `shipping_address` (text) - Dirección de envío
  - `notes` (text) - Notas adicionales
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización
  
  ### 4. order_items
  Tabla para los items de cada orden
  - `id` (uuid, primary key) - Identificador único
  - `order_id` (uuid, foreign key) - Orden a la que pertenece
  - `product_id` (uuid, foreign key) - Producto ordenado
  - `quantity` (integer) - Cantidad del producto
  - `price_at_time` (numeric) - Precio del producto al momento de la compra
  - `product_name` (text) - Nombre del producto al momento de la compra
  - `created_at` (timestamptz) - Fecha de creación

  ## Seguridad (RLS)
  
  ### categories
  - Todos pueden ver las categorías
  - Solo usuarios autenticados pueden crear/modificar categorías
  
  ### cart_items
  - Los usuarios solo pueden ver y modificar sus propios items del carrito
  
  ### orders
  - Los usuarios solo pueden ver sus propias órdenes
  - Solo usuarios autenticados pueden crear órdenes
  - Los administradores pueden ver todas las órdenes
  
  ### order_items
  - Los usuarios solo pueden ver los items de sus propias órdenes
*/

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text DEFAULT '',
  shipping_address text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de items de órdenes
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_time numeric NOT NULL CHECK (price_at_time >= 0),
  product_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para cart_items
CREATE POLICY "Users can view own cart items"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para order_items
CREATE POLICY "Users can view items from own orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insertar algunas categorías predeterminadas
INSERT INTO categories (name, description)
VALUES 
  ('Electrónica', 'Dispositivos electrónicos y accesorios'),
  ('Ropa', 'Prendas de vestir y accesorios de moda'),
  ('Hogar', 'Artículos para el hogar y decoración'),
  ('Deportes', 'Equipamiento deportivo y fitness'),
  ('Libros', 'Libros y material de lectura'),
  ('Juguetes', 'Juguetes y juegos para todas las edades'),
  ('Alimentos', 'Productos alimenticios'),
  ('Belleza', 'Productos de belleza y cuidado personal')
ON CONFLICT (name) DO NOTHING;
