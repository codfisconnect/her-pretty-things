import type { Product } from '../types/Product';
import type { Category } from '../types/Category';
import { products as localProducts } from '../data/products';
import { categories as localCategories } from '../data/categories';
import { api } from './api';

export const productService = {
  // Fetch all hijab products
  async getAllProducts(): Promise<Product[]> {
    try {
      const data = await api.get<{ success: boolean; data: Product[] }>('/products');
      if (data && data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return localProducts;
    } catch {
      // Fallback to local products store
      return localProducts;
    }
  },

  // Get a single hijab product by ID
  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const data = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
      if (data && data.success && data.data) {
        return data.data;
      }
      return localProducts.find(p => p.id === id);
    } catch {
      return localProducts.find(p => p.id === id);
    }
  },

  // Get hijab product by slug
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const data = await api.get<{ success: boolean; data: Product }>(`/products/slug/${slug}`);
      if (data && data.success && data.data) {
        return data.data;
      }
      return localProducts.find(p => p.slug === slug);
    } catch {
      return localProducts.find(p => p.slug === slug);
    }
  },

  // Filter products by category
  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const all = await this.getAllProducts();
    const cleanSlug = categorySlug.toLowerCase().trim();
    if (cleanSlug === 'all' || cleanSlug === 'all-hijabs') return all;
    if (cleanSlug === 'premium-hijab-collection' || cleanSlug === 'premium') {
      return all.filter(p => p.isFeatured || p.price >= 1400);
    }
    return all.filter(
      p => p.categorySlug.toLowerCase() === cleanSlug ||
           p.category.toLowerCase().replace(/\s+/g, '-').includes(cleanSlug)
    );
  },

  // Get featured hijab products
  async getFeaturedProducts(): Promise<Product[]> {
    const all = await this.getAllProducts();
    return all.filter(p => p.isFeatured || p.isBestSeller);
  },

  // Get related hijab products
  async getRelatedProducts(currentId: string, category: string, limit = 4): Promise<Product[]> {
    const all = await this.getAllProducts();
    return all
      .filter(p => p.id !== currentId && p.category.toLowerCase() === category.toLowerCase())
      .slice(0, limit);
  },

  // Get all hijab categories
  async getCategories(): Promise<Category[]> {
    try {
      const data = await api.get<{ success: boolean; data: Category[] }>('/products/categories');
      if (data && data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return localCategories;
    } catch {
      return localCategories;
    }
  }
};
