import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import { productService } from '../../services/productService';
import type { Product } from '../../types/Product';
import './CompleteAtelier.css';

export const CompleteAtelier: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getAllProducts().then((all) => {
      setProducts(all);
      setLoading(false);
    });
  }, []);

  return (
    <div className="complete-atelier-page">
      {/* Top Header Section */}
      <header className="atelier-intro-header">
        <div className="atelier-intro-inner">
          <h1 className="atelier-title">The Complete Atelier</h1>
          <p className="atelier-intro-text">
            Welcome to the beating heart of YUSRAA. Here, master textile engineering converges with the
            timeless grace of modest drapery. Explore our entire house repertoire—each piece woven from
            unadulterated natural fibres, calibrated for non-slip stability, and finished with couture
            hand-rolled hems.
          </p>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="atelier-catalog-section">
        <div className="atelier-catalog-inner">
          <div className="atelier-section-heading-wrap">
            <h2 className="atelier-section-title">Complete Hijab Collection</h2>
            <p className="atelier-product-count">
              Showing all {products.length} house creations
            </p>
          </div>

          {loading ? (
            <div className="atelier-loading-state">
              <p>Curating atelier creations...</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </main>
    </div>
  );
};
