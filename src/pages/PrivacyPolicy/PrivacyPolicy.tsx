import React from 'react';
import './PrivacyPolicy.css';

export const PrivacyPolicy: React.FC = () => {
  return (
    <article className="legal-page-container">
      <header className="legal-header">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-meta">Last Updated: January 2026 • YUSRAA Luxury Hijabs Atelier</p>
      </header>

      <div className="legal-content">
        <p>
          At YUSRAA (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), protecting the privacy and personal data of our
          valued clients is fundamental to our service ethics. This Privacy Policy details how we
          collect, handle, and safeguard your information when you browse our boutique or purchase
          our modest wear collections.
        </p>

        <h2 className="legal-section-h2">1. Information We Collect</h2>
        <p>We collect essential information to process your orders and enhance your atelier experience:</p>
        <ul>
          <li><strong>Personal Identifiers:</strong> Name, delivery address, billing address, email address, and phone number.</li>
          <li><strong>Transaction Details:</strong> Payment method tokenization (processed via PCI-DSS certified gateways; we never store raw credit card numbers).</li>
          <li><strong>Browsing Preferences:</strong> Selected currency (INR, AED, USD, GBP), cart items, and fabric search interests.</li>
        </ul>

        <h2 className="legal-section-h2">2. How We Utilize Your Data</h2>
        <p>Your data is used strictly for:</p>
        <ul>
          <li>Fulfilling and tracking your hijab delivery orders.</li>
          <li>Providing styling concierge customer support and order updates.</li>
          <li>Sending optional YUSRAA Circle newsletters if you have consented to receive them.</li>
          <li>Protecting against unauthorized transactions and cyber fraud.</li>
        </ul>

        <h2 className="legal-section-h2">3. Data Sharing &amp; Third Parties</h2>
        <p>
          YUSRAA does not sell, rent, or trade your personal information to third parties. We share
          strictly necessary data with trusted logistics partners (e.g. Blue Dart, DHL Express)
          solely for delivery execution.
        </p>

        <h2 className="legal-section-h2">4. Contact Our Privacy Officer</h2>
        <p>
          For data access requests, deletion inquiries, or concerns regarding your privacy, please
          contact: <strong>privacy@yusraahijabs.com</strong>.
        </p>
      </div>
    </article>
  );
};
