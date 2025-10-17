/*
  # E-commerce Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price)
      - `category` (text, either 'phones' or 'pcs')
      - `image_url` (text, product image URL)
      - `stock` (integer, available quantity)
      - `created_at` (timestamp)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_amount` (numeric)
      - `status` (text, order status)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `price` (numeric, price at time of purchase)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own cart and orders
    - Add policies for public read access to products
    - Add policies for users to read their own orders
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  category text NOT NULL CHECK (category IN ('phones', 'pcs')),
  image_url text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Cart policies (users can manage their own cart)
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies (users can manage their own orders)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
  ('iPhone 15 Pro', 'Latest Apple flagship with A17 Pro chip and titanium design', 999.99, 'phones', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 50),
  ('Samsung Galaxy S24', 'Powerful Android phone with AI features and stunning display', 899.99, 'phones', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 45),
  ('Google Pixel 8 Pro', 'Pure Android experience with amazing camera capabilities', 799.99, 'phones', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg', 40),
  ('OnePlus 12', 'Fast charging flagship with smooth performance', 699.99, 'phones', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg', 35),
  ('MacBook Pro 16"', 'Professional laptop with M3 Max chip and stunning Retina display', 2499.99, 'pcs', 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 30),
  ('Dell XPS 15', 'Premium Windows laptop with InfinityEdge display', 1799.99, 'pcs', 'https://images.pexels.com/photos/7974/pexels-photo.jpg', 25),
  ('HP Spectre x360', 'Versatile 2-in-1 laptop with elegant design', 1499.99, 'pcs', 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg', 20),
  ('Lenovo ThinkPad X1', 'Business-class laptop with legendary keyboard', 1699.99, 'pcs', 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg', 28)
ON CONFLICT DO NOTHING;