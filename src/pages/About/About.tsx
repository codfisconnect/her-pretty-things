import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, ShieldCheck, Heart } from 'lucide-react';
import './About.css';

export const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <span className="about-tag">The YUSRAA Heritage</span>
        <h1 className="about-title">Dedicated to the Art of Modest Drapery</h1>
        <p className="about-intro">
          YUSRAA was conceived to bring uncompromising textile luxury to the modest wardrobe.
          We believe the hijab is not merely an accessory, but an intimate expression of faith,
          dignity, and timeless poise.
        </p>
      </div>

      <div className="about-hero-grid">
        <div className="about-img-frame">
          <img
            src="/src/assets/images/yusraa-about-editorial.jpg"
            alt="YUSRAA Modest Fashion Atelier"
          />
        </div>

        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', marginBottom: '1.25rem', color: '#1a1614' }}>
            Where Fabric Meets Devotion
          </h2>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#554e48', marginBottom: '1.25rem' }}>
            Traditional hijabs often compromise on comfort—forcing women to endure slippery
            synthetic fabrics, heavy thermal weight, or delicate weaves that fray at the first pin.
          </p>
          <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#554e48', marginBottom: '1.5rem' }}>
            At YUSRAA, our textile engineers test each weave against real-world modest styling.
            Our Malaysian high-density chiffons retain a crisp facial arch without drooping;
            our Kashmiri pashminas provide regal warmth without suffocating bulk; and our grade
            6A mulberry silks feature a custom matte-reverse weave that anchors to hair without sliding.
          </p>

          <Link to="/shop" className="hero-primary-btn">
            Experience Our Hijabs
          </Link>
        </div>
      </div>

      <div className="about-values-grid">
        <div className="value-card">
          <Feather size={28} color="#9b783e" />
          <h3 className="value-title">Featherlight Touch</h3>
          <p className="value-desc">
            Ultra-fine filament weaves engineered to allow continuous airflow, preventing moisture
            buildup and heat fatigue throughout long working days.
          </p>
        </div>

        <div className="value-card">
          <ShieldCheck size={28} color="#9b783e" />
          <h3 className="value-title">Zero-Slip Stability</h3>
          <p className="value-desc">
            Textured micro-crepe and matte-back finishes eliminate the constant need for readjustment
            and reduce dependence on multiple pins.
          </p>
        </div>

        <div className="value-card">
          <Heart size={28} color="#9b783e" />
          <h3 className="value-title">Hair-Kind Fibres</h3>
          <p className="value-desc">
            Natural mulberry silk and organic beechwood modal preserve natural hair oils, prevent
            follicle friction, and reduce split ends.
          </p>
        </div>
      </div>
    </div>
  );
};
