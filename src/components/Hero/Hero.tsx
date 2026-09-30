import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section" aria-label="Hero Introduction">
      <div className="hero-inner">
        {/* Content Column */}
        <div className="hero-content">
          <div className="hero-pretitle-tag">
            <Sparkles size={14} aria-hidden="true" />
            <span>The Yusraa Haute Modesty Atelier</span>
          </div>

          <h1 className="hero-main-heading">
            Elegance in Every Drape: <br />
            <span className="hero-heading-highlight">YUSRAA Luxury Hijabs</span>
          </h1>

          <p className="hero-description-text">
            Discover artisanal Malaysian high-density chiffon, royal Kashmiri pashmina,
            and pure grade 6A mulberry silk hijabs. Impeccably woven for non-slip comfort,
            effortless grace, and timeless modesty.
          </p>

          <div className="hero-actions-group">
            <Link to="/shop" className="hero-primary-btn" id="hero-shop-btn">
              <span>Explore Hijabs</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>

            <Link to="/premium-hijab-collection" className="hero-secondary-btn" id="hero-collection-btn">
              <span>Premium Collection</span>
            </Link>
          </div>
        </div>

        {/* Imagery Column */}
        <div className="hero-imagery-wrapper">
          <div className="hero-image-card">
            <img
              src="/src/assets/images/yusraa-hero-model.jpg"
              alt="Yusraa Premium Hijab Model wearing signature Malaysian Chiffon"
              className="hero-main-photo"
              loading="eager"
            />

            <div className="hero-floating-badge">
              <ShieldCheck size={28} color="#9b783e" aria-hidden="true" />
              <div>
                <p className="hero-badge-title">100% Pure Fabrics</p>
                <p className="hero-badge-sub">Non-Slip • Ultra-Soft • Breathable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
