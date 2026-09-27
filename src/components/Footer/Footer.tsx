import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ExternalLink, Camera } from 'lucide-react'
import Logo from '../../../public/images/Logo/HPTlog.png'
import { fetchBusinessInfoApi, type BusinessInfo } from '../../services/businessService'

export const Footer: React.FC = () => {
  const [info, setInfo] = useState<BusinessInfo>({
    companyName: 'Her Pretty Things',
    tagline: 'Little joys, beautifully wrapped',
    email: 'shop.herprettythings@gmail.com',
    phone: '9790858125',
    locationLocality: 'Royapettah',
    locationCity: 'Chennai',
    locationState: 'Tamil Nadu',
    locationCountry: 'India',
    instagramHandle: '@her_prettythings',
    instagramUrl: 'https://www.instagram.com/her_prettythings/',
    businessHours: 'Mon - Sat: 10:00 AM - 7:00 PM',
  })

  useEffect(() => {
    fetchBusinessInfoApi().then(setInfo)
  }, [])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${info.locationLocality}, ${info.locationCity}, ${info.locationState}, India`
  )}`

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-main container">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-mark">
              <img src={Logo} alt="Her Pretty Things Logo" />
            </span>
            <span>Her Pretty Things</span>
          </Link>
          <p className="footer-tagline">
            Small delights, aesthetic jewellery, and custom curated boxes to make your heart smile. ♡
          </p>
          <a
            className="instagram-link"
            href={info.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
          >
            <Camera size={15} /> {info.instagramHandle}
          </a>
        </div>

        {/* Shop Column */}
        <div className="footer-column">
          <h3>Shop</h3>
          <Link to="/scoops">Scoops</Link>
          <Link to="/jewellery">Jewellery</Link>
          <Link to="/kawaii">Kawaii</Link>
          <Link to="/byob">Build Your Own Box</Link>
          <Link to="/play">Pretty Play 🎁</Link>
        </div>

        {/* Customer Help Column */}
        <div className="footer-column">
          <h3>Help & Care</h3>
          <Link to="/shipping">Shipping & Delivery</Link>
          <Link to="/return">Replacement Policy</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/about">About Us</Link>
        </div>

        {/* Contact & Location Column */}
        <div className="footer-column footer-contact-col">
          <h3>Get In Touch</h3>
          <p className="footer-locality">
            <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: '#db2777' }} />
            {info.locationLocality}, {info.locationCity}
            <br />
            <small style={{ color: '#8c7b83' }}>{info.locationState}, {info.locationCountry}</small>
          </p>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="footer-map-link">
            Get Directions <ExternalLink size={12} />
          </a>
          <a href={`mailto:${info.email}`} className="email-link">
            <Mail size={14} /> {info.email}
          </a>
          <a href={`tel:${info.phone.replace(/\s+/g, '')}`} className="email-link">
            <Phone size={14} /> {info.phone}
          </a>
        </div>
      </div>

      {/* Compact Bottom Bar */}
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Her Pretty Things. Made with love.</span>
        <span>
          Prepaid Orders Only ✦ Pan India Delivery <span className="footer-heart">♥</span>
        </span>
      </div>
    </footer>
  )
}

export default Footer
