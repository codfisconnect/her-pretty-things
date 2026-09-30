import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import { productService } from '../../services/productService';
import type { Product } from '../../types/Product';
import './PremiumCollection.css';

export const PremiumCollection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getAllProducts().then((all) => {
      // Premium capsule hijabs (silks, pashminas, pearls, and high tier pieces)
      const premium = all.filter(p => p.price >= 1400 || p.isFeatured);
      setProducts(premium);
      setLoading(false);
    });
  }, []);

  return (
    <div className="premium-page">
      <div className="premium-page-header">
        <span className="premium-tag-badge">
          <Sparkles size={13} />
          <span>Haute Modesty Capsule</span>
        </span>
        <h1 className="premium-page-title">The Premium Hijab Collection</h1>
        <p className="premium-page-desc">
          Unrivaled fiber purity, grade 6A mulberry silks, and royal Kashmiri pashminas.
          Designed exclusively for ceremonies, galas, and milestones that deserve the extraordinary.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Curating luxury pieces...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};
