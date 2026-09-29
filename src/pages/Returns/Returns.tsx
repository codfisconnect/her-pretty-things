import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import './Returns.css'

export const Returns: React.FC = () => {
  return (
    <main className="container replacement-page">
      <div className="replacement-header">
        <span className="eyebrow">
          <ShieldCheck size={14} /> FAIR & TRANSPARENT CARE
        </span>
        <h1>Replacement Policy</h1>
        <p>Our commitment to delivering little joys safely to your doorstep.</p>
      </div>

      {/* Primary Policy Banner */}
      <div className="policy-highlight-banner">
        <div className="highlight-icon">✦</div>
        <div>
          <h3>Transit Damage Replacement Policy</h3>
          <p>
            Her Pretty Things does <strong>not</strong> accept general returns, order cancellations, or refunds for change of mind.
            However, we provide a <strong>100% free replacement</strong> if any item arrives broken or damaged during transit.
          </p>
        </div>
      </div>

      <section className="replacement-guidelines-card">
        <h2>Replacement Guidelines & Procedure</h2>

        <div className="rule-item">
          <div className="rule-num">1</div>
          <div>
            <h4>Uncut Unboxing Video Mandatory</h4>
            <p>
              To ensure fairness and prevent fraudulent claims, a single uncut, continuous 360-degree unboxing video is required.
              The video must start from showing the intact shipping label and parcel seal before opening.
            </p>
          </div>
        </div>

        <div className="rule-item">
          <div className="rule-num">2</div>
          <div>
            <h4>Report Within 24 Hours of Delivery</h4>
            <p>
              Please notify us within 24 hours of package delivery with your order ID, unboxing video link, and description of the damage.
            </p>
          </div>
        </div>

        <div className="rule-item">
          <div className="rule-num">3</div>
          <div>
            <h4>Verification & Dispatch</h4>
            <p>
              Our verification team will review your unboxing video within 24 hours. Once verified, a replacement piece of the same item
              will be dispatched to you at no extra shipping cost (subject to stock availability).
            </p>
          </div>
        </div>

        <div className="rule-item">
          <div className="rule-num">4</div>
          <div>
            <h4>Stock Out Alternatives</h4>
            <p>
              In case the damaged piece is currently out of stock, we will offer you an equivalent treasure of your choice or store credit.
            </p>
          </div>
        </div>

        {/* CTA to report damage */}
        <div className="report-action-box">
          <div>
            <h4>Received a damaged parcel?</h4>
            <p>We are ready to replace it. Submit your details through our reporting form.</p>
          </div>
          <Link to="/contact#damage-report" className="button button-dark">
            Report a Damaged Item <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Returns