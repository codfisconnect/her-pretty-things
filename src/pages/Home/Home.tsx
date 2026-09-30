import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, Feather, ShieldCheck } from 'lucide-react';
import { Hero } from '../../components/Hero/Hero';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import { productService } from '../../services/productService';
import { categories as defaultCategories } from '../../data/categories';
import type { Product } from '../../types/Product';
import type { Category } from '../../types/Category';
import './Home.css';

const FEATURED_COLLECTION_SLUGS = [
  'jersey-hijab',
  'chiffon-hijab',
  'pashmina-hijab',
  'premium-hijab-collection'
];

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featured, cats] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getCategories(),
        ]);
        setFeaturedProducts(featured.slice(0, 4));
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Show ONLY the 4 featured collections in exact required order
  const featuredCollections = FEATURED_COLLECTION_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c));

  return (
    <div className="home-page">
      {/* 1. Hero Section - contains the single H1 */}
      <Hero />

      {/* 2. Hijab Categories Section */}
      <section className="categories-section" aria-label="Hijab Categories">
        <div className="categories-inner">
          <div className="home-section-title-wrap">
            <span className="home-section-subtitle">Curated Silhouettes</span>
            <h2 className="home-section-heading">YUSRAA Hijab Collections</h2>
            <p className="home-section-desc">
              From everyday non-slip jerseys to featherlight chiffons, artisanal pashminas,
              and our signature luxury capsule, explore our most coveted hijab ateliers.
            </p>
          </div>

          <div className="categories-grid">
            {featuredCollections.map((cat) => {
              const link =
                cat.slug === 'premium-hijab-collection'
                  ? '/premium-hijab-collection'
                  : `/shop?category=${cat.slug}`;

              return (
                <Link
                  key={cat.id}
                  to={link}
                  className="category-card"
                  id={`cat-card-${cat.slug}`}
                >
                  <img
                    src={cat.image}
                    alt={`YUSRAA ${cat.name}`}
                    className="category-card-bg"
                    loading="lazy"
                  />
                  <div className="category-card-overlay" />
                  <div className="category-card-content">
                    <h3 className="category-card-name">{cat.name}</h3>
                    <span className="category-card-count">Explore Atelier &rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="home-collections-cta-wrap">
            <Link
              to="/collection"
              className="home-collections-cta-btn"
              id="explore-all-collections-btn"
            >
              <span>Explore All Collections &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured Hijabs Section */}
      <section className="featured-hijabs-section" aria-label="Featured Hijabs">
        <div className="featured-hijabs-inner">
          <div className="home-section-title-wrap">
            <span className="home-section-subtitle">Most Coveted</span>
            <h2 className="home-section-heading">Featured Hijabs</h2>
            <p className="home-section-desc">
              Loved by modest women worldwide. Hand-finished edges, breathable weaves, and
              non-slip structure for all-day comfort.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading featured hijabs...</div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="hero-secondary-btn">
              <span>View All Hijabs</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Fabric Collection Spotlight */}
      <section className="fabrics-spotlight-section" aria-label="Fabric Collection Spotlight">
        <div className="fabrics-inner">
          <div className="home-section-title-wrap">
            <span className="home-section-subtitle">Material Mastery</span>
            <h2 className="home-section-heading">Fabric Collection</h2>
            <p className="home-section-desc">
              Every hijab starts with our fabric obsession. Unmatched tactile luxury engineered
              to respect hair health and ensure zero slipping.
            </p>
          </div>

          <div className="fabrics-grid">
            <div className="fabric-item-card">
              <span className="fabric-badge">Airy Breathability</span>
              <h3 className="fabric-title">Malaysian Chiffon</h3>
              <p className="fabric-desc">
                High-density georgette grain that holds structured pleats without ballooning.
                Featherlight, wrinkle-resisting, and gracefully fluid.
              </p>
              <Link to="/shop?category=chiffon-hijab" className="fabric-link">
                Shop Chiffon Hijabs &rarr;
              </Link>
            </div>

            <div className="fabric-item-card">
              <span className="fabric-badge">Royal Thermal Softness</span>
              <h3 className="fabric-title">Kashmiri Pashmina</h3>
              <p className="fabric-desc">
                Hand-loomed cashmere-touch fibres with fine eyelash fringe. Provides cosy warmth
                without bulk, staying securely pinned all day.
              </p>
              <Link to="/shop?category=pashmina-hijab" className="fabric-link">
                Shop Pashmina Hijabs &rarr;
              </Link>
            </div>

            <div className="fabric-item-card">
              <span className="fabric-badge">Lustrous Radiance</span>
              <h3 className="fabric-title">Grade 6A Mulberry Silk</h3>
              <p className="fabric-desc">
                Natural protein fibres that protect hair follicles against frizz and split ends.
                Lustrous sheen with an engineered non-slip matte reverse.
              </p>
              <Link to="/shop?category=silk-hijab" className="fabric-link">
                Shop Silk Hijabs &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. About YUSRAA Atelier */}
      <section className="home-about-section" aria-label="About YUSRAA">
        <div className="home-about-inner">
          <div className="home-about-img-box">
            <img
              src="/src/assets/images/yusraa-about-editorial.jpg"
              alt="YUSRAA Atelier Craftsmanship"
              className="home-about-img"
              loading="lazy"
            />
          </div>

          <div>
            <span className="home-section-subtitle">The Yusraa Philosophy</span>
            <h2 className="home-section-heading">Devoted Purely to Modest Excellence</h2>
            <p className="home-section-desc" style={{ marginBottom: '1.25rem' }}>
              YUSRAA was founded on a singular conviction: that modest women deserve hijabs
              crafted with the exact same textile mastery as heritage luxury houses.
            </p>
            <p className="home-section-desc" style={{ marginBottom: '2rem' }}>
              We design exclusively for the hijab experience—testing every weave for tensile
              strength, pin-snag resistance, breathability, and non-slip stability.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Feather size={20} color="#9b783e" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Featherlight Drape</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} color="#9b783e" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Zero Slip Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={20} color="#9b783e" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Grade 6A Mulberry Silks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Award size={20} color="#9b783e" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Ethical Craftsmanship</span>
              </div>
            </div>

            <Link to="/about-us" className="hero-secondary-btn">
              <span>Read Our Full Story</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Call To Action (CTA) */}
      <section className="home-cta-section" aria-label="Discover Your Perfect Hijab">
        <div className="home-cta-inner">
          <h2 className="home-cta-title">Find Your Signature Hijab Today</h2>
          <p className="home-cta-text">
            Experience the softest, most breathable modest wear designed for modern elegance.
            Enjoy complimentary gift packaging and express worldwide delivery.
          </p>
        </div>
      </section>
    </div>
  );
};
