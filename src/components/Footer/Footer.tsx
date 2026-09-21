import { Camera, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main container">
<div className="footer-brand"><Link className="brand" to="/"><span className="brand-mark">✦</span><span>Her Pretty Things</span></Link><p>Small things that make<br />your heart feel happy.</p><a className="instagram-link" href="https://www.instagram.com/her_prettythings?stkn=MWF5YWpobGF3YjhsMA==" target="_blank" rel="noreferrer"><Camera size={16} /> @herprettythings</a></div>        <div className="footer-column"><h3>Shop</h3><Link to="/scoops">Scoops</Link><Link to="/jewellery">Jewellery</Link><Link to="/kawaii">Kawaii</Link></div>
        <div className="footer-column"><h3>Customer Care</h3><Link to="/contact">Contact Us</Link><Link to="/faq">FAQ</Link><Link to="/shipping">Shipping & Delivery</Link><Link to="/returns">Returns</Link></div>
        <div className="footer-signup"><p>Get pretty updates</p><span>New drops, sweet notes, no clutter.</span><a href="mailto:shop.herprettythings@gmail.com" className="email-link"><Mail size={16} /> shop.herprettythings@gmail.com</a></div>
      </div>
      <div className="footer-bottom container"><span>© 2025 Her Pretty Things. Made with love.</span><span>Pretty things, happy hearts <span className="footer-heart">♥</span></span></div>
    </footer>
  )
}

export default Footer