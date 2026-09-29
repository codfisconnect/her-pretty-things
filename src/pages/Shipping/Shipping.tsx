import React from 'react'
import { Link } from 'react-router-dom'
import { Truck, ShieldCheck } from 'lucide-react'
import './Shipping.css'

export const Shipping: React.FC = () => {
  return (
    <main className="container shipping-page">
      <div className="shipping-header">
        <span className="eyebrow">
          <Truck size={14} /> CAREFULLY PACKED & DISPATCHED
        </span>
        <h1>Shipping & Delivery</h1>
        <p>Everything you need to know about how your pretty packages reach your doorstep.</p>
      </div>

      <div className="shipping-grid-cards">
        <div className="shipping-card">
          <div className="ship-icon">🚚</div>
          <h3>Pan India Delivery</h3>
          <p>
            We ship to almost every serviceable pincode across India through reliable courier partners.
          </p>
        </div>

        <div className="shipping-card">
          <div className="ship-icon">⚡</div>
          <h3>24–48 Hours Dispatch</h3>
          <p>
            Orders are carefully prepared, safely bubble-wrapped, and dispatched within 24 to 48 business hours.
          </p>
        </div>

        <div className="shipping-card">
          <div className="ship-icon">💳</div>
          <h3>Prepaid Orders Only</h3>
          <p>
            To ensure swift, contactless fulfillment and avoid delivery rejections, we accept prepaid orders via UPI, Cards, and NetBanking.
          </p>
        </div>

        <div className="shipping-card">
          <div className="ship-icon">🎁</div>
          <h3>Protective Packaging</h3>
          <p>
            Every order is cushioned in aesthetic boxes and secure wrapping so your jewellery and kawaii finds arrive safely.
          </p>
        </div>
      </div>

      <section className="shipping-details-content">
        <h2>Delivery Timelines & Details</h2>

        <div className="timeline-block">
          <h4>Metro Cities</h4>
          <p>Expected delivery within 3 to 5 business days after dispatch.</p>
        </div>

        <div className="timeline-block">
          <h4>Rest of India</h4>
          <p>Expected delivery within 5 to 7 business days after dispatch.</p>
        </div>

        <div className="timeline-block">
          <h4>Shipping Charges</h4>
          <p>
            Shipping fees are calculated transparently during checkout based on package weight and type (for example, ₹150 for Build Your Own Box).
          </p>
        </div>

        <div className="timeline-block">
          <h4>Address Accuracy</h4>
          <p>
            Please provide a complete address with landmarks and a valid 10-digit phone number. Couriers may contact you via SMS or call on delivery day.
          </p>
        </div>

        <div className="shipping-transit-notice">
          <ShieldCheck size={24} color="#db2777" style={{ flexShrink: 0 }} />
          <div>
            <h4>Transit Protection Guarantee</h4>
            <p>
              In the rare event that an item arrives broken or damaged during transit, we offer free replacement.
              Please remember to film an uncut unboxing video upon receiving your parcel.
            </p>
            <Link to="/return" className="transit-link">
              Read our full Replacement Policy →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Shipping