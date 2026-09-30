import type { CartItem, CartState } from '../../src/types/Cart';

class BackendCartService {
  private activeCarts: Map<string, CartItem[]> = new Map();

  getCart(sessionId: string): CartState {
    const items = this.activeCarts.get(sessionId) || [];
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      itemCount
    };
  }

  saveCart(sessionId: string, items: CartItem[]): CartState {
    this.activeCarts.set(sessionId, items);
    return this.getCart(sessionId);
  }

  clearCart(sessionId: string): void {
    this.activeCarts.delete(sessionId);
  }
}

export const backendCartService = new BackendCartService();
