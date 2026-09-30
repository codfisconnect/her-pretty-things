import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import { searchService } from '../../services/searchService';
import { productService } from '../../services/productService';
import type { Product } from '../../types/Product';
import type { Category } from '../../types/Category';
import './Shop.css';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      const results = await searchService.searchHijabs({
        query: currentSearch,
        category: currentCategory,
        sortBy
      });
      setProducts(results);
      setLoading(false);
    };

    fetchFiltered();
  }, [currentCategory, currentSearch, sortBy]);

  const handleCategoryClick = (catSlug: string) => {
    const next = new URLSearchParams(searchParams);
    if (catSlug === 'all') {
      next.delete('category');
    } else {
      next.set('category', catSlug);
    }
    setSearchParams(next);
  };

  return (
    <div className="shop-page">
      <div className="shop-header-banner">
        <h1 className="shop-title">The Yusraa Hijab Collection</h1>
        <p className="shop-subtitle">
          Explore our complete catalogue of luxury hijabs. Handcrafted in Malaysian chiffon,
          cashmere pashmina, pure mulberry silk, and modal.
        </p>
      </div>

      <div className="shop-layout">
        {/* Sidebar Categories */}
        <aside className="shop-sidebar" aria-label="Hijab Category Filter">
          <h2 className="filter-section-title">Hijab Categories</h2>
          <ul className="category-filter-list">
            <li>
              <button
                type="button"
                className={`category-filter-btn ${currentCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('all')}
              >
                <span>All Hijabs</span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  id={`filter-cat-${cat.slug}`}
                  className={`category-filter-btn ${currentCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products Main View */}
        <main>
          <div className="shop-sort-row">
            <span className="shop-results-count">
              Showing {products.length} {products.length === 1 ? 'hijab' : 'hijabs'}
              {currentSearch && ` matching "${currentSearch}"`}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label htmlFor="shop-sort-select" style={{ fontSize: '0.85rem', color: '#666' }}>
                Sort By:
              </label>
              <select
                id="shop-sort-select"
                className="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading hijabs...</div>
          ) : (
            <ProductGrid
              products={products}
              emptyMessage={
                currentSearch
                  ? `No hijabs found matching "${currentSearch}". Try searching for chiffon, silk, or pashmina.`
                  : 'No hijabs found in this category.'
              }
            />
          )}
        </main>
      </div>
    </div>
  );
};
