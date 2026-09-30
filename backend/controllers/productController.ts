import { Request, Response, NextFunction } from 'express';
import { backendProductService } from '../services/productService';

export const productController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category } = req.query;
      const products = await backendProductService.getAll(
        typeof search === 'string' ? search : undefined,
        typeof category === 'string' ? category : undefined
      );
      res.json({ success: true, count: products.length, data: products });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await backendProductService.getById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Hijab product not found' });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await backendProductService.getBySlug(req.params.slug);
      if (!product) {
        res.status(404).json({ success: false, message: 'Hijab product not found' });
        return;
      }
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await backendProductService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await backendProductService.createProduct(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
};
