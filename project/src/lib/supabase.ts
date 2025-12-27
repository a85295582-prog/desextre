import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  subcategory_id?: string;
  sku?: string;
  brand?: string;
  dimensions?: string;
  compatibility?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  parent_id?: string | null;
  name: string;
  order_position: number;
  is_active: boolean;
  level?: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionalSection {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  category?: string;
  position: 'top' | 'middle' | 'bottom' | 'between_categories';
  order_position: number;
  is_active: boolean;
  section_type: 'full_width' | 'half_width' | 'grid_2' | 'grid_3';
  created_at: string;
  updated_at: string;
}

const BUCKET_NAME = 'products';

export async function uploadProductImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;

  const { error, data } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}
