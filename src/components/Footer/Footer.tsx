import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-top-inner">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand-logo">
            YUSRAA
          </Link>
          <p className="footer-brand-desc">
            YUSRAA is a luxury modest wear atelier dedicated exclusively to haute hijabs.
            From breathable Malaysian chiffons and royal Kashmiri pashminas to grade 6A
            mulberry silks, our pieces celebrate graceful modesty with unparalleled comfort.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', color: '#c5a059', fontSize: '0.85rem' }}>
            <span>Non-Slip Weaves</span> • <span>Featherlight Drape</span> • <span>Ethically Sourced</span>
          </div>
        </div>

        {/* Hijab Collections */}
        <div>
          <h3 className="footer-col-title">Hijab Collections</h3>
          <ul className="footer-nav-list">
            <li>
              <Link to="/shop?category=chiffon-hijab" className="footer-nav-link">
                Malaysian Chiffon Hijabs
              </Link>
            </li>
            <li>
              <Link to="/shop?category=pashmina-hijab" className="footer-nav-link">
                Cashmere Pashmina Hijabs
              </Link>
            </li>
            <li>
              <Link to="/shop?category=silk-hijab" className="footer-nav-link">
                Mulberry Silk Hijabs
              </Link>
            </li>
            <li>
              <Link to="/shop?category=jersey-hijab" className="footer-nav-link">
                Egyptian Jersey Hijabs
              </Link>
            </li>
            <li>
              <Link to="/shop?category=modal-hijab" className="footer-nav-link">
                Lenzing Modal Hijabs
              </Link>
            </li>
            <li>
              <Link to="/premium-hijab-collection" className="footer-nav-link">
                Premium Hijab Collection
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care & Legal */}
        <div>
          <h3 className="footer-col-title">Customer Care</h3>
          <ul className="footer-nav-list">
            <li>
              <Link to="/about-us" className="footer-nav-link">
                About YUSRAA
              </Link>
            </li>
            <li>
              <Link to="/faq" className="footer-nav-link">
                Hijab Care &amp; FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="footer-nav-link">
                Contact Atelier
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="footer-nav-link">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="footer-nav-link">
                Refund &amp; Return Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="footer-nav-link">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter & Atelier Circle */}
        <div>
          <h3 className="footer-col-title">The Atelier Circle</h3>
          <p className="footer-newsletter-text">
            Subscribe to receive private invitations to limited fabric drops, modest styling
            guides, and privileged festive previews.
          </p>

          {subscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c5a059', fontSize: '0.85rem' }}>
              <Check size={16} />
              <span>Thank you for joining the YUSRAA Circle.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-newsletter-input"
                aria-label="Email for YUSRAA newsletter"
              />
              <button type="submit" className="footer-newsletter-btn">
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p style={{ margin: 0 }}>
            &copy; 2026 YUSRAA Luxury Hijabs. All rights reserved.
          </p>

          <div className="footer-legal-links">
            <Link to="/privacy-policy" className="footer-legal-link">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="footer-legal-link">
              Terms &amp; Conditions
            </Link>
            <Link to="/shipping-policy" className="footer-legal-link">
              Shipping Information
            </Link>
            <Link to="/refund-policy" className="footer-legal-link">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
