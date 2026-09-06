import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Scoops', to: '/scoops' },
  { label: 'Jewellery', to: '/jewellery' },
  { label: 'Kawaii', to: '/kawaii' },
  { label: 'About Us', to: '/about' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="announcement-bar">Free shipping on orders over $50 <span>✦</span> Little joys, beautifully wrapped</div>
      <div className="nav-wrap container">
        <Link className="brand" to="/" onClick={() => setIsMenuOpen(false)}>
          <span className="brand-mark">✦</span>
          <span>Her Pretty Things</span>
        </Link>

        <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-button" type="button" aria-label="Search"><Search size={19} strokeWidth={1.8} /></button>
          <button className="icon-button desktop-only" type="button" aria-label="Wishlist"><Heart size={19} strokeWidth={1.8} /></button>
          <Link className="icon-button cart-button" to="/cart" aria-label="Shopping cart"><ShoppingBag size={19} strokeWidth={1.8} /><span className="cart-count">0</span></Link>
          <button className="icon-button menu-toggle" type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
