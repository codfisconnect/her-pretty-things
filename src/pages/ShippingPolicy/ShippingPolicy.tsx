import React from 'react';
import './ShippingPolicy.css';

export const ShippingPolicy: React.FC = () => {
  return (
    <article className="shipping-policy-container">
      <header className="shipping-header">
        <h1 className="shipping-title">Shipping &amp; Delivery Information</h1>
        <p className="shipping-meta">YUSRAA White-Glove Modest Wear Logistics</p>
      </header>

      <div className="shipping-content">
        <p>
          At YUSRAA, every order is treated as a piece of couture art. Hijabs are carefully wrapped
          in acid-free tissue paper, infused with our atelier fragrance note, and placed within our
          rigid gold-embossed presentation boxes to ensure pristine arrival.
        </p>

        <h2>1. Delivery Destinations &amp; Estimates</h2>
        <table className="shipping-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Estimated Transit Time</th>
              <th>Shipping Rates</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>India (Domestic Express)</strong></td>
              <td>2 to 4 business days</td>
              <td>FREE on orders over ₹999 (else ₹99 flat)</td>
            </tr>
            <tr>
              <td><strong>United Arab Emirates &amp; GCC</strong></td>
              <td>3 to 5 business days</td>
              <td>FREE on orders over AED 250 (else AED 35)</td>
            </tr>
            <tr>
              <td><strong>United Kingdom &amp; Europe</strong></td>
              <td>4 to 7 business days</td>
              <td>FREE on orders over £80 (else £12)</td>
            </tr>
            <tr>
              <td><strong>United States &amp; Canada</strong></td>
              <td>5 to 8 business days</td>
              <td>FREE on orders over $100 (else $15)</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Dispatch &amp; Tracking</h2>
        <p>
          Orders placed before 2:00 PM IST (Monday through Saturday) are typically dispatched
          on the same business day. Once your parcel departs our atelier, you will receive an SMS
          and email containing your active carrier tracking link (Blue Dart, DHL, or FedEx).
        </p>

        <h2>3. Customs &amp; Import Duties</h2>
        <p>
          For international shipments, import tariffs or local customs clearance duties that may be
          levied by the recipient country&apos;s customs authorities remain the responsibility of the client.
        </p>
      </div>
    </article>
  );
};
