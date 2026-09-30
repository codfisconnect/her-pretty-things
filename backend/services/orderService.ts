import type { Order } from '../../src/types/Order';

class BackendOrderService {
  private orders: Order[] = [];

  async create(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: orderData.id || `YUS-${Math.floor(100000 + Math.random() * 900000)}`,
      items: orderData.items || [],
      shippingAddress: orderData.shippingAddress || {
        fullName: 'Customer',
        email: 'customer@example.com',
        phone: '1234567890',
        addressLine1: 'Address',
        city: 'City',
        state: 'State',
        postalCode: '12345',
        country: 'India'
      },
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee || 0,
      total: orderData.total || 0,
      currency: orderData.currency || 'INR',
      paymentMethod: orderData.paymentMethod || 'card',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  async getAll(): Promise<Order[]> {
    return this.orders;
  }

  async getById(id: string): Promise<Order | undefined> {
    return this.orders.find(o => o.id === id);
  }

  async updateStatus(id: string, status: Order['orderStatus']): Promise<Order | null> {
    const order = this.orders.find(o => o.id === id);
    if (!order) return null;
    order.orderStatus = status;
    return order;
  }
}

export const backendOrderService = new BackendOrderService();
