import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { SearchBar } from '../SearchBar/SearchBar';
import { CurrencySelector } from '../CurrencySelector/CurrencySelector';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="mobile-menu-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mobile-menu-header">
          <Link to="/" className="mobile-logo-text" onClick={onClose}>
            YUSRAA
          </Link>
          <button
            type="button"
            id="mobile-menu-close-btn"
            className="mobile-menu-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="mobile-menu-search-box">
          <SearchBar onSelect={onClose} placeholder="Search hijabs..." />
        </div>

        {/* Main Navigation */}
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/" end className="mobile-nav-item-link" onClick={onClose}>
              <span>Home</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop" end className="mobile-nav-item-link" onClick={onClose}>
              <span>Shop Hijabs</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/complete-atelier" className="mobile-nav-item-link" onClick={onClose} id="mobile-nav-complete-atelier">
              <span>Complete Atelier</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/collection" className="mobile-nav-item-link" onClick={onClose}>
              <span>Collections</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/premium-hijab-collection" className="mobile-nav-item-link" onClick={onClose}>
              <span>Premium</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/about-us" className="mobile-nav-item-link" onClick={onClose}>
              <span>About</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/faq" className="mobile-nav-item-link" onClick={onClose}>
              <span>FAQ</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className="mobile-nav-item-link" onClick={onClose}>
              <span>Contact</span>
              <ChevronRight size={16} />
            </NavLink>
          </li>
        </ul>

        {/* Hijab Fabric Categories */}
        <div className="mobile-sub-header">Signature Hijab Fabrics</div>
        <ul className="mobile-nav-links">
          <li>
            <Link to="/shop?category=chiffon-hijab" className="mobile-nav-item-link" onClick={onClose}>
              <span>Malaysian Chiffon</span>
            </Link>
          </li>
          <li>
            <Link to="/shop?category=pashmina-hijab" className="mobile-nav-item-link" onClick={onClose}>
              <span>Cashmere Pashmina</span>
            </Link>
          </li>
          <li>
            <Link to="/shop?category=silk-hijab" className="mobile-nav-item-link" onClick={onClose}>
              <span>Mulberry Silk</span>
            </Link>
          </li>
          <li>
            <Link to="/shop?category=jersey-hijab" className="mobile-nav-item-link" onClick={onClose}>
              <span>Egyptian Jersey</span>
            </Link>
          </li>
          <li>
            <Link to="/shop?category=modal-hijab" className="mobile-nav-item-link" onClick={onClose}>
              <span>Lenzing Modal</span>
            </Link>
          </li>
        </ul>

        {/* Footer info & currency */}
        <div className="mobile-menu-footer">
          <div className="mobile-currency-row">
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Currency:</span>
            <CurrencySelector />
          </div>
          <Link to="/admin" className="mobile-support-link" onClick={onClose}>
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
