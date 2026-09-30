import { backendProductService } from './productService';
import { backendOrderService } from './orderService';

class BackendAdminService {
  async getDashboardStats() {
    const products = await backendProductService.getAll();
    const orders = await backendOrderService.getAll();

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock < 15).length;

    return {
      totalSales,
      totalOrders,
      totalProducts,
      lowStockCount,
      recentOrders: orders.slice(0, 5),
    };
  }
}

export const backendAdminService = new BackendAdminService();
