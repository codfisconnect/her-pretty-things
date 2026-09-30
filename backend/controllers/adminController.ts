import { Request, Response, NextFunction } from 'express';
import { backendAdminService } from '../services/adminService';
import { backendOrderService } from '../services/orderService';
import { backendProductService } from '../services/productService';

export const adminController = {
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await backendAdminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await backendOrderService.updateStatus(id, status);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await backendProductService.updateProduct(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Hijab product not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await backendProductService.deleteProduct(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Hijab product not found' });
        return;
      }
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
