import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Plus, Minus, Trash2, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import './Cart.css';

export const Cart: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shipping,
    total,
    totalItems,
  } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-page" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <ShoppingBag size={56} color="#c5a059" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
        <h1 className="cart-title">Your Hijab Bag is Empty</h1>
        <p style={{ color: '#666', maxWidth: 460, margin: '0 auto 2rem', lineHeight: 1.6 }}>
          You have not added any hijabs yet. Explore our handcrafted Malaysian chiffons,
          royal Kashmiri pashminas, and pure mulberry silks.
        </p>
        <Link to="/shop" className="hero-primary-btn">
          Explore The Hijab Store
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Hijab Bag ({totalItems})</h1>

      <div className="cart-grid-layout">
        {/* Items List */}
        <div className="cart-table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#666' }}>Selected Items</span>
            <button
              type="button"
              onClick={clearCart}
              style={{ background: 'none', border: 'none', color: '#c94a4a', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Clear Entire Bag
            </button>
          </div>

          {items.map((item, idx) => {
            const colour = item.selectedColour || item.product.colour;
            const p = item.product;
            const img = p.images?.[0] || p.image || '/src/assets/images/yusraa-hero-model.jpg';

            return (
              <div key={`${p.id}-${colour}-${idx}`} className="cart-item-row-card">
                <div className="cart-item-thumb-box">
                  <img src={img} alt={`Yusraa ${p.name}`} className="cart-item-img" />
                </div>

                <div className="cart-item-details">
                  <Link to={`/shop/${p.categorySlug}/${p.slug}`} className="cart-item-title-link">
                    {p.name}
                  </Link>
                  <span className="cart-item-meta-text">Fabric: {p.fabric} • Shade: {colour}</span>

                  <div className="cart-item-controls-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="quickcart-qty-btn"
                        onClick={() => updateQuantity(p.id, colour, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="quickcart-qty-btn"
                        onClick={() => updateQuantity(p.id, colour, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <span className="cart-item-unit-price">{formatPrice(p.price * item.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(p.id, colour)}
                        style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="cart-summary-card">
          <h2 className="summary-heading">Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Estimated Shipping</span>
            <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>

          {shipping === 0 && (
            <div style={{ fontSize: '0.78rem', color: '#2e7d32', marginBottom: '0.85rem' }}>
              ✓ You have unlocked free express delivery!
            </div>
          )}

          <div className="summary-row total-bold">
            <span>Estimated Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            type="button"
            id="proceed-checkout-btn"
            className="cart-checkout-btn-full"
            onClick={() => navigate('/checkout')}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={17} />
          </button>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8rem',
              color: '#777',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={16} color="#9b783e" />
            <span>Guaranteed Safe &amp; Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
