import { Camera, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main container">
        <div className="footer-brand"><Link className="brand" to="/"><span className="brand-mark">✦</span><span>Her Pretty Things</span></Link><p>Small things that make<br />your heart feel happy.</p><a className="instagram-link" href="https://instagram.com" target="_blank" rel="noreferrer"><Camera size={16} /> @herprettythings</a></div>
        <div className="footer-column"><h3>Quick links</h3><Link to="/">Home</Link><Link to="/scoops">Scoops</Link><Link to="/jewellery">Jewellery</Link><Link to="/kawaii">Kawaii</Link><Link to="/about">About Us</Link></div>
        <div className="footer-column"><h3>Shop</h3><Link to="/scoops">Scoops</Link><Link to="/jewellery">Jewellery</Link><Link to="/kawaii">Kawaii</Link></div>
        <div className="footer-column"><h3>Customer Care</h3><a href="mailto:hello@herprettythings.com">Contact Us</a><a href="mailto:hello@herprettythings.com">FAQ</a><a href="mailto:hello@herprettythings.com">Shipping & Delivery</a><a href="mailto:hello@herprettythings.com">Returns</a></div>
        <div className="footer-signup"><p>Get pretty updates</p><span>New drops, sweet notes, no clutter.</span><a href="mailto:hello@herprettythings.com" className="email-link"><Mail size={16} /> hello@herprettythings.com</a></div>
      </div>
      <div className="footer-bottom container"><span>© 2025 Her Pretty Things. Made with love.</span><span>Pretty things, happy hearts <span className="footer-heart">♥</span></span></div>
    </footer>
  )
}

export default Footer
