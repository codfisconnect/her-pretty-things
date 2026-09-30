import { Request, Response, NextFunction } from 'express';
import { backendOrderService } from '../services/orderService';

export const orderController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await backendOrderService.create(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await backendOrderService.getAll();
      res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await backendOrderService.getById(req.params.id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
};
