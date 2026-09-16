// Product type definitions placeholder.
export type ProductCategory = "scoops" | "jewellery" | "kawaii";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  images: string[];
  rating: number;
  description: string;
  stock: number;
  featured?: boolean;
}
