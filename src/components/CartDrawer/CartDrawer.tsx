import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles, Gift } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './CartDrawer.css'

export const CartDrawer: React.FC = () => {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart, itemCount, subtotal, shipping, total } = useCart()
  const navigate = useNavigate()

  if (!isDrawerOpen) return null

  const handleCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <div className="cart-drawer-backdrop" onClick={closeDrawer} role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag size={20} strokeWidth={1.8} />
            <h2>Your Pretty Cart</h2>
            <span className="cart-drawer-badge">{itemCount}</span>
          </div>
          <button type="button" className="cart-drawer-close" onClick={closeDrawer} aria-label="Close cart drawer">
            <X size={20} />
          </button>
        </div>

        {/* Free gift / shipping banner */}
        <div className="cart-drawer-promo">
          <Sparkles size={14} />
          <span>Prepaid orders only ✦ Fast dispatch across India</span>
        </div>

        {/* Content */}
        <div className="cart-drawer-body">
          {(!cart || cart.items.length === 0) ? (
            <div className="cart-drawer-empty">
              <ShoppingBag size={48} strokeWidth={1.2} />
              <h3>Your cart is empty</h3>
              <p>Discover something lovely to fill it with sparkle.</p>
              <div className="cart-empty-actions">
                <Link to="/scoops" className="button button-dark" onClick={closeDrawer}>
                  Shop Scoops
                </Link>
                <Link to="/byob" className="button button-outline" onClick={closeDrawer}>
                  Build Your Own Box
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-drawer-items">
              {cart.items.map((item) => {
                const isScoop = item.isCustomizedScoop
                const isByob = item.isByob
                const byobDetails = item.byobDetails

                return (
                  <div className="cart-drawer-item" key={item.id}>
                    {/* Item Image */}
                    <div className="cart-drawer-item-img">
                      {isScoop ? (
                        <div className="cart-scoop-thumb">🍨</div>
                      ) : isByob ? (
                        <div className="cart-byob-thumb">🎁</div>
                      ) : (
                        <img
                          src={item.product?.image || '/placeholder.png'}
                          alt={item.product?.name || 'Product'}
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="cart-drawer-item-details">
                      <div className="cart-drawer-item-top">
                        <h4>
                          {isScoop
                            ? `${item.numberOfScoops}-Scoop Surprise`
                            : isByob
                            ? 'Build Your Own Box'
                            : item.product?.name}
                        </h4>
                        <button
                          type="button"
                          className="cart-drawer-delete"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Meta info */}
                      {isScoop && (
                        <p className="cart-drawer-meta">
                          {item.colourTheme ? `Theme: ${item.colourTheme}` : 'Mystery selection'}
                        </p>
                      )}

                      {isByob && (byobDetails as any)?.items && (
                        <div className="cart-drawer-byob-preview">
                          <small>
                            <Gift size={12} /> {(byobDetails as any).items.length} items inside box
                          </small>
                        </div>
                      )}

                      {/* Pricing and Quantity */}
                      <div className="cart-drawer-item-bottom">
                        <div className="cart-qty-controls">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            disabled={item.product?.stock !== undefined && item.quantity >= item.product.stock}
                            onClick={() => {
                              if (item.product?.stock !== undefined && item.quantity >= item.product.stock) {
                                return
                              }
                              updateQuantity(item.id, item.quantity + 1)
                            }}
                            aria-label="Increase quantity"
                            title={item.product?.stock !== undefined && item.quantity >= item.product.stock ? 'Maximum stock reached' : undefined}
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-drawer-price">
                          <span className="unit-price">₹{item.unitPrice.toLocaleString('en-IN')}</span>
                          <strong className="total-price">₹{item.total.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-summary">
              <div className="cart-drawer-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="cart-drawer-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="cart-drawer-row total-row">
                <span>Total</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="cart-drawer-actions">
              <button
                type="button"
                className="cart-drawer-checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight size={17} />
              </button>
              <Link
                to="/cart"
                className="cart-drawer-view-cart"
                onClick={closeDrawer}
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default CartDrawer
