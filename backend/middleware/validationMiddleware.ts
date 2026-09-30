import { Request, Response, NextFunction } from 'express';

export const validateOrderPayload = (req: Request, res: Response, next: NextFunction): void => {
  const { items, shippingAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    return;
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email) {
    res.status(400).json({ success: false, message: 'Full name and email are required for delivery' });
    return;
  }

  next();
};

export const validateProductPayload = (req: Request, res: Response, next: NextFunction): void => {
  const { name, category, price } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ success: false, message: 'Valid product name is required' });
    return;
  }

  if (!category || typeof category !== 'string') {
    res.status(400).json({ success: false, message: 'Valid hijab category is required' });
    return;
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    res.status(400).json({ success: false, message: 'Valid positive price is required' });
    return;
  }

  next();
};
