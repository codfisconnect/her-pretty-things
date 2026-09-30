import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/storefront endpoints that allow guests, proceed
    return next();
  }

  const token = authHeader.split(' ')[1];
  // Simple token verification for store demo
  if (token.startsWith('admin-token')) {
    req.user = { id: 'admin-1', email: 'admin@yusraa.com', role: 'admin' };
  } else {
    req.user = { id: 'user-1', email: 'customer@yusraa.com', role: 'customer' };
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};
