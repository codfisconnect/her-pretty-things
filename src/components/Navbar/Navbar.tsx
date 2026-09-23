import { useEffect, useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { getCart } from '../../services/cartService'
import { products } from '../../data/products'
import Logo from "../../../public/images/Logo/HPTlog.png"

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Scoops', to: '/scoops' },
  { label: 'Jewellery', to: '/jewellery' },
  { label: 'Kawaii', to: '/kawaii' },
  { label: 'About Us', to: '/about' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadCartCount = async () => {
      const cartId = localStorage.getItem('hpt_cart_id')

      if (!cartId) {
        setCartCount(0)
        return
      }

      try {
        const cart = await getCart(cartId)

        const totalQuantity = cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        )

        setCartCount(totalQuantity)
      } catch {
        setCartCount(0)
      }
    }

    loadCartCount()
  }, [])
const searchResults = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  return (
    <header className="site-header">

      {/* Announcement Bar */}
      <div className="announcement-wrapper">
        <div className="announcement-bar">
          IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little joys, beautifully wrapped ✦&nbsp;
        </div>

        <div className="announcement-bar" aria-hidden="true">
          IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little joys, beautifully wrapped ✦&nbsp;
        </div>

        <div className="announcement-bar" aria-hidden="true">
          IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little joys, beautifully wrapped ✦&nbsp;
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-wrap container">

        {/* Logo */}
        <Link
          className="brand"
          to="/"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="brand-mark">
            <img src={Logo} alt="" />
          </span>

          <span>Her Pretty Things</span>
        </Link>

        {/* Navigation Links */}
        <nav
          className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? 'active' : ''
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Navigation Actions */}
        <div className="nav-actions">

          {/* Search Button */}
          <button
            className="icon-button"
            type="button"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? (
              <X size={19} strokeWidth={1.8} />
            ) : (
              <Search size={19} strokeWidth={1.8} />
            )}
          </button>

          {/* Wishlist */}
          <Link
            className="icon-button"
            to="/wishlist"
            aria-label="Wishlist"
          >
            <Heart size={19} strokeWidth={1.8} />
          </Link>

          {/* Cart */}
          <Link
            className="icon-button cart-button"
            to="/cart"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={19} strokeWidth={1.8} />

            <span className="cart-count">
              {cartCount}
            </span>
          </Link>

          {/* Mobile Menu */}
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={
              isMenuOpen ? 'Close menu' : 'Open menu'
            }
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

        </div>
      </div>

      {/* Search Panel */}
      {isSearchOpen && (
        <div className="search-panel container">

          <input
            type="text"
            placeholder="Search pretty things..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="search-results">

              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="search-result-item"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div>
                    <strong>{product.name}</strong>
                    <span>₹{product.price}</span>
                  </div>
                </Link>
              ))}

              {/* No Results */}
              {searchResults.length === 0 && (
                <p className="search-no-results">
                  No products found.
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