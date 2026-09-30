import type { Product } from '../types/Product';
import { productService } from './productService';

export interface SearchFilters {
  query?: string;
  category?: string;
  fabric?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export const searchService = {
  // Case-insensitive search strictly across hijab products
  async searchHijabs(filters: SearchFilters): Promise<Product[]> {
    const all = await productService.getAllProducts();
    let results = [...all];

    // Query filter (strictly case-insensitive)
    if (filters.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(q);
        const catMatch = product.category.toLowerCase().includes(q);
        const descMatch = product.description.toLowerCase().includes(q);
        const shortDescMatch = product.shortDescription.toLowerCase().includes(q);
        const fabricMatch = product.fabric.toLowerCase().includes(q);
        const colourMatch = product.colour.toLowerCase().includes(q);

        return nameMatch || catMatch || descMatch || shortDescMatch || fabricMatch || colourMatch;
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'all' && filters.category.trim() !== '') {
      const cat = filters.category.toLowerCase().trim();
      if (cat === 'premium' || cat === 'premium-hijab-collection') {
        results = results.filter(p => p.isFeatured || p.price >= 1400);
      } else {
        results = results.filter(
          p => p.categorySlug.toLowerCase() === cat ||
               p.category.toLowerCase().replace(/\s+/g, '-').includes(cat)
        );
      }
    }

    // Fabric filter
    if (filters.fabric && filters.fabric !== 'all') {
      const fab = filters.fabric.toLowerCase().trim();
      results = results.filter(p => p.fabric.toLowerCase().includes(fab));
    }

    // Price range
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= (filters.maxPrice ?? Infinity));
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          results.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
          break;
        case 'featured':
        default:
          results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return results;
  }
};
