import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Truck, Gift, ArrowRight, Lock, AlertCircle } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { createOrder, type ShippingDetails } from '../../services/orderService'
import { createPayment, verifyPayment } from '../../services/paymentService'
import { validateRewardCodeApi } from '../../services/gameService'
import './Checkout.css'

declare global {
  interface Window {
    Razorpay: any
  }
}

export const Checkout: React.FC = () => {
  const { cart, subtotal, shipping, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  // Promo code
  const [promoCode, setPromoCode] = useState('')
  const [appliedReward, setAppliedReward] = useState<{
    code: string
    rewardType: string
    rewardDescription: string
  } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)

  // Payment & submit state
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [paymentPending, setPaymentPending] = useState(false)

  // Ensure Razorpay SDK script is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  if (!cart || cart.items.length === 0) {
    return (
      <main className="container checkout-empty-wrap">
        <h2>Your Cart is Empty</h2>
        <p>Add some lovely things to your cart before proceeding to checkout.</p>
        <Link to="/scoops" className="button button-dark" style={{ marginTop: '1rem' }}>
          Explore Scoops
        </Link>
      </main>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoError('')
    setValidatingPromo(true)
    try {
      const res = await validateRewardCodeApi(promoCode.trim())
      if (res.valid) {
        setAppliedReward(res)
        setPromoCode('')
      } else {
        setPromoError('Invalid or expired promo code.')
      }
    } catch {
      setPromoError('Could not validate promo code.')
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedReward(null)
  }

  // Trigger Razorpay payment flow
  const launchRazorpay = async (orderId: string, _orderTotal?: number) => {
    setSubmitting(true)
    setOrderError('')
    try {
      const paymentData = await createPayment(orderId)

      // Fallback if testing without active keys or in offline mock
      if (!window.Razorpay || !paymentData.keyId || paymentData.keyId.startsWith('mock_')) {
        // Mock instant success for testing
        await verifyPayment({
          orderId,
          razorpayOrderId: paymentData.razorpayOrderId || 'mock_rzp_order',
          razorpayPaymentId: 'mock_pay_' + Date.now(),
          razorpaySignature: 'mock_sig',
        })
        await clearCart()
        navigate(`/payment/success/${orderId}`)
        return
      }

      const rzp = new window.Razorpay({
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Her Pretty Things',
        description: `Order #${orderId}`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phoneNumber,
        },
        theme: {
          color: '#db2777',
        },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            await clearCart()
            navigate(`/payment/success/${orderId}`)
          } catch (err: any) {
            setOrderError(err.message || 'Payment verification failed. Please contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => {
            // Dismissed - Do NOT cancel order. Allow Retry!
            setSubmitting(false)
            setPaymentPending(true)
            setOrderError('Payment window was closed. You can retry paying now.')
          },
        },
      })

      rzp.open()
    } catch (err: any) {
      console.error('Launch Razorpay error:', err)
      setOrderError(err.message || 'Could not initiate payment. Please retry.')
      setSubmitting(false)
    }
  }

  // Handle Checkout submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderError('')
    setSubmitting(true)

    try {
      // 1. Create order in backend
      const order = await createOrder(
        cart.id,
        formData,
        user?.id || undefined,
        appliedReward?.code || undefined
      )

      setCreatedOrderId(order.id)
      localStorage.setItem('hpt_order_id', order.id)

      // 2. Launch Razorpay payment
      await launchRazorpay(order.id, order.totalAmount)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setOrderError(err.message || 'Could not create order. Please check all fields.')
      setSubmitting(false)
    }
  }

  return (
    <main className="container checkout-page">
      <div className="checkout-page-header">
        <span className="eyebrow">
          <Lock size={14} /> SECURE 256-BIT ENCRYPTED CHECKOUT
        </span>
        <h1>Complete Your Order</h1>
      </div>

      {orderError && (
        <div className="checkout-alert error" role="alert">
          <AlertCircle size={17} />
          <span>{orderError}</span>
          {paymentPending && createdOrderId && (
            <button
              type="button"
              className="retry-pay-btn"
              onClick={() => launchRazorpay(createdOrderId, total)}
              disabled={submitting}
            >
              Retry Payment
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkout-grid-layout">
        {/* Left Column: Shipping Address */}
        <div className="checkout-form-col">
          <section className="checkout-card">
            <h2>Shipping & Contact Information</h2>

            <div className="checkout-form-grid">
              <label className="checkout-input-group full">
                <span>Full Name *</span>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Diya Sen"
                  autoComplete="name"
                />
              </label>

              <label className="checkout-input-group half">
                <span>Email Address *</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="checkout-input-group half">
                <span>Phone Number *</span>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </label>

              <label className="checkout-input-group full">
                <span>Address Line 1 (Flat, House, Street) *</span>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Flat 3B, Sunshine Apartments, 12th Cross"
                  autoComplete="address-line1"
                />
              </label>

              <label className="checkout-input-group full">
                <span>Address Line 2 (Area, Landmark - Optional)</span>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Near Lotus Garden"
                  autoComplete="address-line2"
                />
              </label>

              <label className="checkout-input-group third">
                <span>City *</span>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Chennai"
                  autoComplete="address-level2"
                />
              </label>

              <label className="checkout-input-group third">
                <span>State *</span>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Tamil Nadu"
                  autoComplete="address-level1"
                />
              </label>

              <label className="checkout-input-group third">
                <span>Pincode *</span>
                <input
                  type="text"
                  name="pincode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="600014"
                  autoComplete="postal-code"
                />
              </label>
            </div>
          </section>

          {/* Delivery & Security Note */}
          <div className="checkout-trust-box">
            <div className="trust-row">
              <Truck size={18} color="#db2777" />
              <div>
                <strong>Pan India Fast Dispatch</strong>
                <p>Orders are dispatched within 24-48 hours. Prepaid orders only.</p>
              </div>
            </div>
            <div className="trust-row">
              <ShieldCheck size={18} color="#db2777" />
              <div>
                <strong>Transit Replacement Guarantee</strong>
                <p>100% replacement in case of transit damage (unboxing video required).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Payment Button */}
        <aside className="checkout-sidebar-col">
          <div className="checkout-summary-card">
            <h2>Order Summary ({cart.items.length} items)</h2>

            {/* Items mini list */}
            <div className="checkout-items-mini-list">
              {cart.items.map((item) => (
                <div key={item.id} className="checkout-mini-item">
                  <div className="mini-item-name">
                    <span>
                      {item.isCustomizedScoop
                        ? `${item.numberOfScoops}-Scoop Surprise`
                        : item.isByob
                        ? 'Custom Gift Box (BYOB)'
                        : item.product?.name}
                    </span>
                    <small>Qty: {item.quantity}</small>
                  </div>
                  <strong>₹{item.total.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>

            {/* Promo / Pretty Play Reward code */}
            <div className="checkout-promo-box">
              <div className="promo-input-row">
                <input
                  type="text"
                  placeholder="Promo or Game Reward code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={validatingPromo || !promoCode.trim()}
                >
                  {validatingPromo ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {promoError && <span className="promo-err-msg">{promoError}</span>}

              {appliedReward && (
                <div className="applied-promo-tag">
                  <Gift size={14} />
                  <span>{appliedReward.code}: {appliedReward.rewardDescription}</span>
                  <button type="button" onClick={handleRemovePromo}>×</button>
                </div>
              )}
            </div>

            {/* Math */}
            <div className="checkout-math">
              <div className="math-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="math-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              {appliedReward && (
                <div className="math-row gift-row">
                  <span>Free Gift</span>
                  <span className="free-gift-text">One Cute Pen (Included)</span>
                </div>
              )}
              <div className="math-row total-row">
                <span>Total Amount</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="checkout-pay-btn"
              disabled={submitting}
            >
              {submitting ? 'Connecting to Razorpay...' : `Pay ₹${total.toLocaleString('en-IN')} with Razorpay`}
              <ArrowRight size={17} />
            </button>

            <p className="checkout-safe-note">
              ✦ Fast UPI, Cards, NetBanking, and Wallets accepted safely.
            </p>
          </div>
        </aside>
      </form>
    </main>
  )
}

export default Checkout
