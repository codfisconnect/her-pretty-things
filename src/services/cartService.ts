import type { CartItem, CartState } from '../types/Cart';
import type { Product } from '../types/Product';

const CART_STORAGE_KEY = 'yusraa_hijab_cart_v2';

export const cartService = {
  getStoredCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  },

  calculateState(items: CartItem[]): CartState {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      items,
      itemCount,
      subtotal
    };
  },

  addItem(items: CartItem[], product: Product, quantity = 1, selectedColour?: string): CartItem[] {
    const colour = selectedColour || product.colour;
    const existingIndex = items.findIndex(
      item => item.product.id === product.id && item.selectedColour === colour
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      this.saveCart(updated);
      return updated;
    }

    const newItem: CartItem = {
      id: `${product.id}-${colour}-${Date.now()}`,
      product,
      quantity,
      selectedColour: colour
    };

    const updated = [...items, newItem];
    this.saveCart(updated);
    return updated;
  },

  updateQuantity(items: CartItem[], itemId: string, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(items, itemId);
    }
    const updated = items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    this.saveCart(updated);
    return updated;
  },

  removeItem(items: CartItem[], itemId: string): CartItem[] {
    const updated = items.filter(item => item.id !== itemId);
    this.saveCart(updated);
    return updated;
  },

  clearCart(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  }
};
