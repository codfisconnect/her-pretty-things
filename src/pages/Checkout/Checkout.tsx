import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Lock, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/Order';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const order = await orderService.createOrder({
        items,
        shippingAddress: formData,
        subtotal,
        shippingFee: shipping,
        total,
        currency,
        paymentMethod,
      });

      setCompletedOrder(order);
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Could not complete order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="checkout-page">
        <div className="order-success-card">
          <div className="order-success-icon-wrap">
            <CheckCircle2 size={40} />
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
            Thank You for Your Order
          </h1>

          <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.6 }}>
            Your YUSRAA modest wear package is now being lovingly prepared in our signature luxury presentation box.
          </p>

          <div>
            Order Reference:
            <br />
            <span className="order-success-ref">{completedOrder.id}</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#554e48', marginBottom: '2rem' }}>
            A confirmation email has been dispatched to <strong>{completedOrder.shippingAddress.email}</strong>.
            Delivery estimated within 2–4 business days.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="hero-primary-btn">
              Return to Home
            </Link>
            <Link to="/shop" className="hero-secondary-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h1 className="checkout-heading">Your Cart is Empty</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Please add a hijab to your bag before proceeding to checkout.
        </p>
        <Link to="/shop" className="hero-primary-btn">
          Explore Hijabs
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-heading">Secure Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-grid">
        {/* Left: Shipping & Payment details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Shipping Form */}
          <div className="checkout-card">
            <h2 className="checkout-card-title">1. Delivery Address</h2>

            <div className="checkout-form-grid">
              <div className="form-field-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="form-input"
                  placeholder="e.g. Ayesha Rahman"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-form-grid two-col">
                <div className="form-field-group">
                  <label className="form-label" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="ayesha@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-label" htmlFor="addressLine1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  required
                  className="form-input"
                  placeholder="Apartment, suite, street name"
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-form-grid two-col">
                <div className="form-field-group">
                  <label className="form-label" htmlFor="city">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="form-input"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label" htmlFor="state">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    className="form-input"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-form-grid two-col">
                <div className="form-field-group">
                  <label className="form-label" htmlFor="postalCode">
                    Postal / PIN Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    className="form-input"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label" htmlFor="country">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    className="form-input"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-card">
            <h2 className="checkout-card-title">2. Payment Method</h2>

            <div className="payment-options-group" role="radiogroup" aria-label="Select Payment Method">
              <label
                className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <CreditCard size={20} color="#9b783e" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '0.78rem', color: '#777' }}>Visa, Mastercard, RuPay, Amex</div>
                </div>
              </label>

              <label
                className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <Smartphone size={20} color="#9b783e" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Instant UPI / NetBanking</div>
                  <div style={{ fontSize: '0.78rem', color: '#777' }}>GPay, PhonePe, Paytm, QR</div>
                </div>
              </label>

              <label
                className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <Banknote size={20} color="#9b783e" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: '0.78rem', color: '#777' }}>Pay upon physical arrival</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary-box">
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', margin: '0 0 1.25rem 0' }}>
            Items in Order ({items.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {items.map((item, idx) => {
              const p = item.product;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span>
                    {p.name} {item.selectedColour && <span style={{ color: '#9b783e', fontSize: '0.8rem' }}>• {item.selectedColour}</span>} <span style={{ color: '#888' }}>x {item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(p.price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid rgba(197, 160, 89, 0.25)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(197, 160, 89, 0.25)'
              }}
            >
              <span>Total:</span>
              <span style={{ color: '#9b783e' }}>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            id="place-order-btn"
            disabled={isSubmitting}
            className="checkout-submit-btn"
          >
            <Lock size={16} />
            <span>{isSubmitting ? 'Placing Order...' : `Pay & Place Order (${formatPrice(total)})`}</span>
          </button>

          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              color: '#888',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={16} color="#9b783e" />
            <span>256-Bit SSL Encrypted &amp; Verified</span>
          </div>
        </div>
      </form>
    </div>
  );
};
