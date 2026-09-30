import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { CurrencySelector } from '../CurrencySelector/CurrencySelector';
import { CartIcon } from '../CartIcon/CartIcon';
import { SearchBar } from '../SearchBar/SearchBar';
import { MobileMenu } from '../MobileMenu/MobileMenu';
import './Header.css';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header" role="banner">
        <div className="header-inner">
          {/* Left: Mobile Toggle & Brand */}
          <div className="header-left">
            <button
              type="button"
              id="mobile-nav-toggle-btn"
              className="mobile-menu-trigger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={24} />
            </button>

            <Link to="/" className="brand-logo-link" aria-label="YUSRAA Home">
              <span className="brand-logo-text">YUSRAA</span>
              <span className="brand-tagline-badge">Luxury Hijabs</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="main-navigation" aria-label="Primary Navigation">
            <ul className="nav-links-list">
              <li>
                <NavLink to="/" end className="nav-link-item">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" end className="nav-link-item">
                  Shop Hijabs
                </NavLink>
              </li>
              <li>
                <NavLink to="/complete-atelier" className="nav-link-item" id="nav-complete-atelier">
                  Complete Atelier
                </NavLink>
              </li>
              <li>
                <NavLink to="/collection" className="nav-link-item">
                  Collections
                </NavLink>
              </li>
              <li>
                <NavLink to="/premium-hijab-collection" className="nav-link-item">
                  Premium
                </NavLink>
              </li>
              <li>
                <NavLink to="/about-us" className="nav-link-item">
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/faq" className="nav-link-item">
                  FAQ
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="nav-link-item">
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Right: Search, Currency & Cart */}
          <div className="header-right">
            <div className="header-search-wrap">
              <SearchBar placeholder="Search hijabs..." />
            </div>
            <CurrencySelector />
            <CartIcon />
          </div>
        </div>
      </header>

      {/* Responsive Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};
