import { products } from '../../src/data/products';
import { categories } from '../../src/data/categories';
import type { Product } from '../../src/types/Product';

class BackendProductService {
  private productList: Product[] = [...products];

  async getAll(query?: string, category?: string): Promise<Product[]> {
    let result = [...this.productList];

    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      const cat = category.toLowerCase().trim();
      if (cat === 'premium' || cat === 'premium-hijab-collection') {
        result = result.filter(p => p.isFeatured || p.price >= 1400);
      } else {
        result = result.filter(
          p => p.categorySlug.toLowerCase() === cat ||
               p.category.toLowerCase().replace(/\s+/g, '-').includes(cat)
        );
      }
    }

    return result;
  }

  async getById(id: string): Promise<Product | undefined> {
    return this.productList.find(p => p.id === id);
  }

  async getBySlug(slug: string): Promise<Product | undefined> {
    return this.productList.find(p => p.slug === slug);
  }

  async getCategories() {
    return categories;
  }

  async createProduct(newProd: Omit<Product, 'id'>): Promise<Product> {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    this.productList.unshift(created);
    return created;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const idx = this.productList.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.productList[idx] = { ...this.productList[idx], ...updates };
    return this.productList[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const lenBefore = this.productList.length;
    this.productList = this.productList.filter(p => p.id !== id);
    return this.productList.length < lenBefore;
  }
}

export const backendProductService = new BackendProductService();
