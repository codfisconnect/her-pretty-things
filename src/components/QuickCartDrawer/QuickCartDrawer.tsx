import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import './QuickCartDrawer.css';

export const QuickCartDrawer: React.FC = () => {
  const {
    items,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div
      className="quickcart-overlay"
      onClick={closeCartDrawer}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Quick View"
    >
      <div className="quickcart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="quickcart-header">
          <div className="quickcart-title-row">
            <ShoppingBag size={20} color="#9b783e" />
            <h2 className="quickcart-title">Your Hijab Bag</h2>
            <span className="quickcart-count-badge">{totalItems}</span>
          </div>
          <button
            type="button"
            id="close-cart-drawer-btn"
            className="quickcart-close-btn"
            onClick={closeCartDrawer}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="quickcart-free-shipping-bar">
          {subtotal >= 999 ? (
            <span>🎉 You have qualified for <strong>Free Express Shipping!</strong></span>
          ) : (
            <span>
              Add <strong>{formatPrice(999 - subtotal)}</strong> more for free express delivery.
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="quickcart-empty">
            <ShoppingBag size={48} color="#d5c4b4" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
              Your Bag is Empty
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#777', marginBottom: '1.5rem' }}>
              Explore our handcrafted chiffon, pashmina, and silk hijabs.
            </p>
            <Link
              to="/shop"
              className="quickcart-checkout-btn"
              onClick={closeCartDrawer}
            >
              Browse Hijabs
            </Link>
          </div>
        ) : (
          <>
            <div className="quickcart-items-list" role="list">
              {items.map((item, index) => {
                const colour = item.selectedColour || item.product.colour;
                const prod = item.product;
                const foundColour = prod.availableColours?.find(c => c.name === colour);
                const itemImg = foundColour?.image || prod.images?.[0] || prod.image || '/yusraa-hero-model.jpg';

                return (
                  <div key={`${prod.id}-${colour}-${index}`} className="quickcart-item-row" role="listitem">
                    <img
                      src={itemImg}
                      alt={`Yusraa ${prod.name}`}
                      className="quickcart-item-thumb"
                    />
                    <div className="quickcart-item-info">
                      <Link
                        to={`/shop/${prod.categorySlug}/${prod.slug}`}
                        className="quickcart-item-name"
                        onClick={closeCartDrawer}
                      >
                        {prod.name}
                      </Link>
                      <span className="quickcart-item-colour">Colour: {colour}</span>
                      <span className="quickcart-item-price">{formatPrice(prod.price * item.quantity)}</span>

                      <div className="quickcart-qty-ctrls">
                        <button
                          type="button"
                          className="quickcart-qty-btn"
                          onClick={() => updateQuantity(prod.id, colour, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${prod.name}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="quickcart-qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="quickcart-qty-btn"
                          onClick={() => updateQuantity(prod.id, colour, item.quantity + 1)}
                          aria-label={`Increase quantity of ${prod.name}`}
                        >
                          <Plus size={12} />
                        </button>

                        <button
                          type="button"
                          className="quickcart-item-del-btn"
                          onClick={() => removeFromCart(prod.id, colour)}
                          aria-label={`Remove ${prod.name} from cart`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="quickcart-footer">
              <div className="quickcart-summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="quickcart-total-line">
                <span>Estimated Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <button
                type="button"
                id="drawer-checkout-btn"
                className="quickcart-checkout-btn"
                onClick={() => {
                  closeCartDrawer();
                  navigate('/checkout');
                }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/cart"
                className="quickcart-viewcart-btn"
                onClick={closeCartDrawer}
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
