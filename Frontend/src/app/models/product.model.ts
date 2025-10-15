export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  currency?: string;          // 'USD', 'CLP', etc.
  image_url?: string | null;
  supplier_name?: string | null;
  available: number;          // stock
  sku?: string | null;
  category?: string | null;
}
