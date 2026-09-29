export type ProductCategory = "scoops" | "jewellery" | "kawaii";

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: ProductCategory | string;
  price: number; // Authoritative selling price
  mrp?: number; // Maximum Retail Price / Original price
  discountAmount?: number;
  discountPercent?: number;
  image: string;
  images: string[];
  rating?: number;
  description: string;
  stock: number;
  sku?: string;
  byobEligible?: boolean;
  active?: boolean;
  featured?: boolean;
}
