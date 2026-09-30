import { Request, Response } from 'express';
import { backendCartService } from '../services/cartService';

export const cartController = {
  getCart(req: Request, res: Response): void {
    const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
    const cart = backendCartService.getCart(sessionId);
    res.json({ success: true, data: cart });
  },

  syncCart(req: Request, res: Response): void {
    const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
    const { items } = req.body;
    const cart = backendCartService.saveCart(sessionId, Array.isArray(items) ? items : []);
    res.json({ success: true, data: cart });
  },

  clearCart(req: Request, res: Response): void {
    const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
    backendCartService.clearCart(sessionId);
    res.json({ success: true, message: 'Cart cleared' });
  }
};
