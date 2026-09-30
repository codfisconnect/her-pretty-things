export interface ColourOption {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductDetails {
  dimensions: string;
  careInstructions: string[];
  opacity: string;
  texture: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  slug: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  description: string;
  shortDescription: string;
  images: string[];
  image?: string;
  stock: number;
  colour: string;
  availableColours: ColourOption[];
  fabric: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  details: ProductDetails;
}
