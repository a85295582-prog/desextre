/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Index
  - Add index on `order_items.product_id` to optimize foreign key lookups

  ### 2. Optimize RLS Policies (Auth RLS Initialization)
  All RLS policies updated to use `(select auth.uid())` instead of `auth.uid()` 
  to prevent re-evaluation for each row, significantly improving query performance at scale.

  Tables optimized:
  - `cart_items`: 4 policies updated
  - `orders`: 3 policies updated  
  - `order_items`: 2 policies updated

  ### 3. Fix Function Security Issue
  - Update `update_updated_at_column()` function with stable search_path to prevent 
    role mutable search_path security vulnerability

  ## Security Impact
  - Prevents potential security vulnerabilities from mutable search paths
  - Improves query performance by reducing auth function re-evaluations
  - Optimizes foreign key lookups with proper indexing
*/

-- 1. Add missing index for order_items.product_id foreign key
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 2. Drop and recreate function with stable search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped by CASCADE
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

-- 3. Optimize RLS policies for cart_items
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
CREATE POLICY "Users can view own cart items"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
CREATE POLICY "Users can insert own cart items"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4. Optimize RLS policies for orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
CREATE POLICY "Authenticated users can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 5. Optimize RLS policies for order_items
DROP POLICY IF EXISTS "Users can view items from own orders" ON order_items;
CREATE POLICY "Users can view items from own orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert order items" ON order_items;
CREATE POLICY "Authenticated users can insert order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (select auth.uid())
    )
  );
