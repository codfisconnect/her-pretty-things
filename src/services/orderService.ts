import type { Order, ShippingAddress } from '../types/Order';
import type { CartItem } from '../types/Cart';
import { api } from './api';

const ORDERS_STORAGE_KEY = 'yusraa_hijab_orders';

export const orderService = {
  async createOrder(params: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    shippingFee: number;
    total: number;
    currency: string;
    paymentMethod: string;
  }): Promise<Order> {
    const orderData: Order = {
      id: `YUS-${Math.floor(100000 + Math.random() * 900000)}`,
      items: params.items,
      shippingAddress: params.shippingAddress,
      subtotal: params.subtotal,
      shippingFee: params.shippingFee,
      total: params.total,
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await api.post<{ success: boolean; data: Order }>('/orders', orderData);
      if (response && response.success && response.data) {
        this.saveOrderLocally(response.data);
        return response.data;
      }
    } catch {
      // Fallback to storing locally
      this.saveOrderLocally(orderData);
    }

    return orderData;
  },

  saveOrderLocally(order: Order): void {
    try {
      const existing = this.getStoredOrders();
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...existing]));
    } catch (e) {
      console.error('Failed to save order locally', e);
    }
  },

  getStoredOrders(): Order[] {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async getOrderById(orderId: string): Promise<Order | undefined> {
    try {
      const res = await api.get<{ success: boolean; data: Order }>(`/orders/${orderId}`);
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch {
      // Check local storage
    }
    const local = this.getStoredOrders();
    return local.find(o => o.id === orderId);
  }
};
