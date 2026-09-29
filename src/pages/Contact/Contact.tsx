import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Phone, Mail, MapPin, Camera, ShieldAlert, Check, ArrowRight, ExternalLink } from 'lucide-react'
import { fetchBusinessInfoApi, submitDamageClaimApi, type BusinessInfo } from '../../services/businessService'
import './Contact.css'

export const Contact: React.FC = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
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
    businessHours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
  })

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const initialOrderId = searchParams.get('orderId') || ''

  // Damage Claim Form State
  const [orderNumber, setOrderNumber] = useState(initialOrderId)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [productName, setProductName] = useState('')
  const [unboxingVideoUrl, setUnboxingVideoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState('')
  const [claimError, setClaimError] = useState('')

  useEffect(() => {
    fetchBusinessInfoApi().then(setBusinessInfo)
  }, [])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${businessInfo.locationLocality}, ${businessInfo.locationCity}, ${businessInfo.locationState}, India`
  )}`

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClaimError('')
    setClaimSuccess('')
    setClaimSubmitting(true)

    try {
      await submitDamageClaimApi({
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        productName: productName.trim(),
        unboxingVideoUrl: unboxingVideoUrl.trim() || undefined,
        description: description.trim(),
      })

      setClaimSuccess(
        'Your transit damage report has been received. Our team will review your unboxing video and get in touch within 24 hours.'
      )
      setOrderNumber('')
      setCustomerName('')
      setCustomerEmail('')
      setProductName('')
      setUnboxingVideoUrl('')
      setDescription('')
    } catch (err: any) {
      setClaimError(err?.message || 'Could not submit claim. Please email us directly.')
    } finally {
      setClaimSubmitting(false)
    }
  }

  return (
    <main className="container contact-page">
      {/* Header */}
      <div className="contact-header">
        <span className="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</span>
        <h1>Contact Her Pretty Things</h1>
        <p>Questions about orders, scoops, custom boxes, or transit care? We are always here to help.</p>
      </div>

      {/* Verified Contact Details Grid */}
      <div className="contact-cards-grid">
        {/* Email */}
        <div className="contact-card">
          <div className="contact-card-icon">
            <Mail size={22} />
          </div>
          <h3>Email Us</h3>
          <p>{businessInfo.email}</p>
          <a href={`mailto:${businessInfo.email}`} className="contact-action-btn">
            Send Email <ArrowRight size={14} />
          </a>
        </div>

        {/* Location */}
        <div className="contact-card">
          <div className="contact-card-icon">
            <MapPin size={22} />
          </div>
          <h3>Business Location</h3>
          <p>
            {businessInfo.locationLocality}, {businessInfo.locationCity}
            <br />
            {businessInfo.locationState}, {businessInfo.locationCountry}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-action-btn"
          >
            Get Directions <ExternalLink size={14} />
          </a>
        </div>

        {/* Phone */}
        <div className="contact-card">
          <div className="contact-card-icon">
            <Phone size={22} />
          </div>
          <h3>Call Support</h3>
          <p>{businessInfo.phone}</p>
          <a href={`tel:${businessInfo.phone.replace(/\s+/g, '')}`} className="contact-action-btn">
            Call Us <ArrowRight size={14} />
          </a>
        </div>

        {/* Instagram */}
        <div className="contact-card">
          <div className="contact-card-icon">
            <Camera size={22} />
          </div>
          <h3>Instagram</h3>
          <p>{businessInfo.instagramHandle}</p>
          <a
            href={businessInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-action-btn"
          >
            Visit Profile <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Business Hours Note */}
      <div className="contact-hours-banner">
        <span>🕒 Business Support Hours: {businessInfo.businessHours}</span>
      </div>

      {/* Transit Damage Report Section */}
      <section id="damage-report" className="damage-claim-section">
        <div className="damage-claim-header">
          <div className="claim-icon-wrap">
            <ShieldAlert size={24} color="#db2777" />
          </div>
          <div>
            <h2>Report a Transit Damaged Item</h2>
            <p>
              In the rare event of damage during transit, Her Pretty Things provides a replacement.
              Please provide your order details and link to your uncut unboxing video.
            </p>
          </div>
        </div>

        {claimSuccess && (
          <div className="claim-alert success" role="alert">
            <Check size={18} />
            <span>{claimSuccess}</span>
          </div>
        )}

        {claimError && (
          <div className="claim-alert error" role="alert">
            <span>{claimError}</span>
          </div>
        )}

        <form onSubmit={handleClaimSubmit} className="damage-claim-form">
          <div className="claim-form-grid">
            <label className="claim-field">
              <span>Order Number *</span>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ord_123456"
              />
            </label>

            <label className="claim-field">
              <span>Your Name *</span>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
              />
            </label>

            <label className="claim-field">
              <span>Your Email *</span>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </label>

            <label className="claim-field">
              <span>Damaged Product Name *</span>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Bow Crystal Pendant"
              />
            </label>

            <label className="claim-field full">
              <span>Unboxing Video Link (Google Drive / Cloud / Social Link) *</span>
              <input
                type="url"
                required
                value={unboxingVideoUrl}
                onChange={(e) => setUnboxingVideoUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
              />
              <small>An uncut unboxing video recorded upon arrival is required to verify claims.</small>
            </label>

            <label className="claim-field full">
              <span>Describe the Damage *</span>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what was damaged inside the package..."
              />
            </label>
          </div>

          <button type="submit" className="claim-submit-btn" disabled={claimSubmitting}>
            {claimSubmitting ? 'Submitting Report...' : 'Submit Damage Claim'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Contact
