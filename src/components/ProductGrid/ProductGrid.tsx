import React from 'react';
import type { Product } from '../../types/Product';
import { ProductCard } from '../ProductCard/ProductCard';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyMessage = 'No hijabs match your selected criteria.',
}) => {
  if (products.length === 0) {
    return (
      <div className="product-grid-empty" role="region" aria-label="No results">
        <h3 className="empty-title">No Hijabs Found</h3>
        <p className="empty-subtext">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid-container" role="feed" aria-label="Hijabs Grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
