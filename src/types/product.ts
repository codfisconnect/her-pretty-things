// Product type definitions placeholder.
export type ProductCategory = "scoops" | "jewellery" | "kawaii";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  rating: number;
  description: string;
  stock: number;
  featured?: boolean;
}