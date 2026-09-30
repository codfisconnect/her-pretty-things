import type { Product } from './Product';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedColour?: string;
  selectedSize?: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColour?: string) => void;
  removeFromCart: (productId: string, colour: string) => void;
  updateQuantity: (productId: string, colour: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}
