import React from 'react';
import './Terms.css';

export const Terms: React.FC = () => {
  return (
    <article className="terms-container">
      <header className="terms-header">
        <h1 className="terms-title">Terms &amp; Conditions</h1>
        <p className="terms-meta">Effective Date: January 1, 2026 • YUSRAA Luxury Hijabs Atelier</p>
      </header>

      <div className="terms-content">
        <p>
          Welcome to the official online boutique of YUSRAA. By browsing, creating an account,
          or placing an order for our luxury hijabs, you agree to comply with and be bound by the
          following Terms and Conditions.
        </p>

        <h2>1. Atelier Products &amp; Fabric Representations</h2>
        <p>
          Every piece offered by YUSRAA is an authentic hijab, modest scarf, or hijab care accessory.
          We make every effort to display the true tones, weave structures, and lustrous sheens of our
          Malaysian chiffons, Kashmiri pashminas, and mulberry silks. However, display calibrations
          across individual screens may cause subtle perceptual variations.
        </p>

        <h2>2. Pricing &amp; Multi-Currency Transactions</h2>
        <p>
          Base prices are established in Indian Rupees (INR) and dynamically converted for your
          convenience into AED, USD, and GBP. All final charges are presented clearly at checkout
          inclusive of applicable duties and taxes.
        </p>

        <h2>3. Orders &amp; Order Acceptance</h2>
        <p>
          Upon placing an order, you will receive an immediate digital confirmation with your unique
          order reference (e.g. YUS-XXXXXX). YUSRAA reserves the right to cancel or refuse orders in
          rare instances of inventory exhaustion, fabric inspection failure, or suspected fraud.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All imagery, typography, editorial photography, descriptions, and brand logos are the
          exclusive intellectual property of YUSRAA. Unauthorized duplication or commercial
          exploitation without prior written authorization is strictly prohibited.
        </p>

        <h2>5. Governing Law</h2>
        <p>
          These Terms and any non-contractual disputes arising from your purchases shall be governed
          by and construed in accordance with applicable laws.
        </p>
      </div>
    </article>
  );
};
