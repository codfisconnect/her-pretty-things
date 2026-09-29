import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Camera } from 'lucide-react'
import Logo from '../../../public/images/Logo/HPTlog.png'
import { fetchBusinessInfoApi, type BusinessInfo } from '../../services/businessService'

export const Footer: React.FC = () => {
  const [info, setInfo] = useState<BusinessInfo>({
    companyName: 'Her Pretty Things',
    tagline: 'Small delights, aesthetic jewellery & curated gifts.',
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
    fetchBusinessInfoApi()
      .then((data) => {
        if (data) {
          setInfo((prev) => ({
            ...prev,
            ...data,
            instagramUrl: 'https://www.instagram.com/her_prettythings/',
            instagramHandle: '@her_prettythings',
          }))
        }
      })
      .catch(() => {})
  }, [])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${info.locationLocality}, ${info.locationCity}, ${info.locationState}, India`
  )}`

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-main container">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link className="brand" to="/" aria-label="Her Pretty Things Home">
            <span className="brand-mark">
              <img src={Logo} alt="Her Pretty Things Logo" />
            </span>
            <span>Her Pretty Things</span>
          </Link>
          <p className="footer-tagline">
            Small delights, aesthetic jewellery & curated gifts.
          </p>
          <a
            className="instagram-link"
            href="https://www.instagram.com/her_prettythings/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Her Pretty Things on Instagram"
          >
            <Camera size={13} />
            <span>@her_prettythings</span>
          </a>
        </div>

        {/* Shop + Help Navigation Columns */}
        <div className="footer-nav-group">
          {/* Shop Column */}
          <div className="footer-column">
            <h3>Shop</h3>
            <Link to="/scoops">Scoops</Link>
            <Link to="/jewellery">Jewellery</Link>
            <Link to="/kawaii">Kawaii</Link>
            <Link to="/byob">Build Your Own Box</Link>
            <Link to="/play">Pretty Play</Link>
          </div>

          {/* Help Column */}
          <div className="footer-column">
            <h3>Help</h3>
            <Link to="/shipping">Shipping & Delivery</Link>
            <Link to="/return">Replacement Policy</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">About Us</Link>
          </div>
        </div>

        {/* Contact & Location Column */}
        <div className="footer-column footer-contact-col">
          <h3>Get In Touch</h3>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-address-link"
            title="Open Royapettah location on Google Maps"
          >
            <MapPin size={13} className="footer-contact-icon" />
            <span className="footer-address-text">
              <span>{info.locationLocality}, {info.locationCity}</span>
              <span className="footer-address-sub">{info.locationState}, {info.locationCountry}</span>
            </span>
          </a>
          <a href={`mailto:${info.email}`} className="email-link" title="Send email">
            <Mail size={13} className="footer-contact-icon" />
            <span>{info.email}</span>
          </a>
          <a href={`tel:${info.phone.replace(/\s+/g, '')}`} className="email-link" title="Call us">
            <Phone size={13} className="footer-contact-icon" />
            <span>{info.phone}</span>
          </a>
        </div>
      </div>

      {/* Bottom Area: Copyright & Developer Credit */}
      <div className="footer-bottom-wrap">
        <div className="footer-bottom container">
          <span>© {new Date().getFullYear()} Her Pretty Things. Made with love.</span>
          <span>Prepaid Orders Only · Pan India Delivery</span>
        </div>
        <div className="footer-credit container">
          <span>Website crafted by </span>
          <a
            href="https://www.codfis.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="codfis-link"
          >
            Codfis Technologies
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

