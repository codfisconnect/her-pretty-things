import { useEffect, useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { getCart } from '../../services/cartService'
import { jewelleryProducts } from '../../data/jewelleryProducts'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Scoops', to: '/scoops' },
  { label: 'Jewellery', to: '/jewellery' },
  { label: 'Kawaii', to: '/kawaii' },
  { label: 'About Us', to: '/about' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

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

  const query = searchQuery.toLowerCase().trim()

  const filteredProducts = jewelleryProducts.filter((product) => {
    if (!query) return false

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  })

  return (
    <header className="site-header">

      <div className="announcement-bar">
        <div className="announcement-track">
          <div className="announcement-content">
            IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little joys, beautifully wrapped
          </div>

          <div className="announcement-content">
            IN PAN INDIA DELIVERY 🚚 <span>✦</span> PREPAID ORDERS ONLY <span>✦</span> FAST DISPATCH FOR QUICK DELIVERY <span>✦</span> Little joys, beautifully wrapped
          </div>
        </div>
      </div>

      <div className="nav-wrap container">

        <Link
          className="brand"
          to="/"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="brand-mark">✦</span>
          <span>Her Pretty Things</span>
        </Link>

        {isSearchOpen && (
          <div className="search-bar">

            <input
              type="text"
              placeholder="Search pretty things..."
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            {searchQuery.trim() && (
              <div className="search-results">

                {filteredProducts.length > 0 ? (

                  filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="search-result-item"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                      />

                      <div>
                        <strong>{product.name}</strong>

                        <span>
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  ))

                ) : (

                  <p className="search-no-results">
                    No products found.
                  </p>

                )}

              </div>
            )}

          </div>
        )}

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

        <div className="nav-actions">

          <button
            className="icon-button"
            type="button"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={19} strokeWidth={1.8} />
          </button>

          <button
            className="icon-button desktop-only"
            type="button"
            aria-label="Wishlist"
          >
            <Heart size={19} strokeWidth={1.8} />
          </button>

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
    </header>
  )
}

export default Navbar