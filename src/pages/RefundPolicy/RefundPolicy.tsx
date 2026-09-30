import React from 'react';
import './RefundPolicy.css';

export const RefundPolicy: React.FC = () => {
  return (
    <article className="refund-policy-container">
      <header className="refund-header">
        <h1 className="refund-title">Refund &amp; Exchange Policy</h1>
        <p className="refund-meta">14-Day Atelier Satisfaction Guarantee</p>
      </header>

      <div className="refund-content">
        <p>
          We take immense pride in the weaving, dyeing, and hand-finishing of every YUSRAA hijab.
          If for any reason you are not completely enchanted with your chosen piece, we offer a
          seamless 14-day return and exchange guarantee.
        </p>

        <h2>1. Eligibility for Returns &amp; Exchanges</h2>
        <p>To qualify for a full refund or exchange:</p>
        <ul>
          <li>The return request must be initiated within 14 calendar days of confirmed delivery.</li>
          <li>The hijab must be in its original unworn condition, unwashed, and free of cosmetics, perfumes, or pin punctures.</li>
          <li>All original branding tags, presentation packaging, and ribbon bands must remain intact.</li>
        </ul>

        <h2>2. Easy Return Procedure</h2>
        <p>
          To start a return, email <strong>concierge@yusraahijabs.com</strong> with your order
          number (e.g. YUS-XXXXXX) and reason for return. Our team will arrange a complimentary
          doorstep courier pickup for domestic addresses within 24 to 48 hours.
        </p>

        <h2>3. Refund Processing</h2>
        <p>
          Once our quality inspectors verify the returned item&apos;s condition, your refund will be
          authorized within 3 business days back to your original payment method (Credit card, UPI,
          or bank transfer). You will receive an automated confirmation receipt.
        </p>
      </div>
    </article>
  );
};
