import React, { useEffect, useState, useRef } from 'react'
import { Heart, Menu, Search, ShoppingBag, X, User } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import type { Product } from '../../types/product'
import { getProducts } from '../../services/productService'
import Logo from '../../../public/images/Logo/HPTlog.webp'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Scoops', to: '/scoops' },
  { label: 'Jewellery', to: '/jewellery' },
  { label: 'Kawaii', to: '/kawaii' },
  { label: 'Build Your Own Box', to: '/byob' },
  { label: 'Pretty Play', to: '/play' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchProducts, setSearchProducts] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)

  const { itemCount, openDrawer } = useCart()
  const { wishlistCount } = useWishlist()
  const { isAuthenticated } = useAuth()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const query = searchQuery.trim()

    if (!query) {
      setSearchProducts([])
      setIsSearchLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsSearchLoading(true)

        const results = await getProducts(undefined, {
          search: query,
        })

        setSearchProducts(results)
      } catch (error) {
        console.error('[Search] Failed to load products:', error)
        setSearchProducts([])
      } finally {
        setIsSearchLoading(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  // Debounced/filtered search results


  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openDrawer()
  }

  return (
    <header className="site-header">
      {/* Announcement Bar */}
      <div className="announcement-wrapper">
        <div className="announcement-bar">
          IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY{' '}
          <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little
          joys, beautifully wrapped ✦&nbsp;
        </div>
        <div className="announcement-bar" aria-hidden="true">
          IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY{' '}
          <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little
          joys, beautifully wrapped ✦&nbsp;
        </div>
        <div className="announcement-bar" aria-hidden="true">
          IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY{' '}
          <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little
          joys, beautifully wrapped ✦&nbsp;
        </div>
      </div>

      {/* Main Navigation Wrap */}
      <div className="nav-wrap container">
        {/* Brand Logo */}
        <Link
          className="brand"
          to="/"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Her Pretty Things Homepage"
        >
          <span className="brand-mark">
            <img src={Logo} alt="Her Pretty Things Logo" />
          </span>
          <span>Her Pretty Things</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="nav-actions">
          {/* Search Toggle */}
          <button
            className="icon-button"
            type="button"
            aria-label={isSearchOpen ? 'Close search' : 'Open search'}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? (
              <X size={19} strokeWidth={1.8} />
            ) : (
              <Search size={19} strokeWidth={1.8} />
            )}
          </button>

          {/* Wishlist Link with Dynamic Instant Count */}
          <Link
            className="icon-button wishlist-button-nav"
            to="/wishlist"
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart size={19} strokeWidth={1.8} />
            {wishlistCount > 0 && (
              <span className="nav-badge wishlist-badge" aria-label={`${wishlistCount} items in wishlist`}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button with Dynamic Instant Count & Drawer Toggle */}
          <button
            className="icon-button cart-button"
            type="button"
            aria-label={`Shopping cart (${itemCount} items)`}
            onClick={handleCartClick}
          >
            <ShoppingBag size={19} strokeWidth={1.8} />
            {itemCount > 0 && (
              <span className="nav-badge cart-count" aria-label={`${itemCount} items in cart`}>
                {itemCount}
              </span>
            )}
          </button>

          {/* Account Icon */}
          <Link
            className="icon-button"
            to={isAuthenticated ? '/profile' : '/login'}
            aria-label={isAuthenticated ? 'My Profile' : 'Sign In'}
          >
            <User size={19} strokeWidth={1.8} />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Global Search Overlay Panel */}
      {isSearchOpen && (
        <div className="search-panel container" role="search">
          <div className="search-input-wrapper">
            <Search size={18} className="search-bar-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search jewellery, scoops, kawaii gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '16px' }} /* Safari Zoom Prevention */
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Instant Search Results */}
          {searchQuery.trim() && (
            <div className="search-results">
              {isSearchLoading ? (
                <p className="search-no-results">Searching...</p>
              ) : searchProducts.length > 0 ? (
                searchProducts.slice(0, 8).map((product) => {
                  const hasDiscount = product.mrp && product.mrp > product.price
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="search-result-item"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      <img src={product.image} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ color: '#2b2226', fontWeight: 600 }}>
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
                            <span style={{ fontSize: '0.8rem', color: '#9c8a92', textDecoration: 'line-through' }}>
                              ₹{product.mrp!.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <p className="search-no-results">
                  No pretty treasures found matching "{searchQuery}".
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
