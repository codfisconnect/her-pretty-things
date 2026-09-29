import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, CreditCard, ShieldAlert } from 'lucide-react'
import { getOrder, type OrderResponse } from '../../services/orderService'

export const CustomerOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    getOrder(orderId)
      .then(setOrder)
      .catch((err) => console.error('Failed to load order:', err))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <main className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p>Loading order details...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <p>We couldn't find the requested order details.</p>
        <Link to="/orders" className="button button-dark" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </main>
    )
  }

  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <main className="container" style={{ maxWidth: 840, paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#716269', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
        <ArrowLeft size={16} /> All Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span className="eyebrow">ORDER SUMMARY</span>
          <h1 style={{ margin: '0.2rem 0', fontSize: '1.8rem' }}>Order #{order.id}</h1>
          <span style={{ fontSize: '0.85rem', color: '#8c7b83' }}>Placed on {dateStr}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{
            background: order.paymentStatus === 'PAID' ? '#ecfdf5' : '#fefce8',
            color: order.paymentStatus === 'PAID' ? '#047857' : '#a16207',
            padding: '0.4rem 0.9rem',
            borderRadius: 9999,
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            Payment: {order.paymentStatus}
          </span>
          <span style={{
            background: '#fdf2f8',
            color: '#be185d',
            padding: '0.4rem 0.9rem',
            borderRadius: 9999,
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            Status: {order.orderStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Grid: Delivery Info + Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        {/* Shipping Address */}
        <div style={{ background: '#ffffff', border: '1px solid #f2e2eb', borderRadius: 16, padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#db2777', marginBottom: '0.6rem' }}>
            <MapPin size={18} />
            <strong style={{ color: '#2b2226' }}>Shipping Address</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b3d43', lineHeight: 1.5 }}>
            <strong>{order.address.fullName}</strong><br />
            {order.address.addressLine1}<br />
            {order.address.addressLine2 && <>{order.address.addressLine2}<br /></>}
            {order.address.city}, {order.address.state} - {order.address.pincode}<br />
            Phone: {order.address.phoneNumber}
          </p>
        </div>

        {/* Payment Details */}
        <div style={{ background: '#ffffff', border: '1px solid #f2e2eb', borderRadius: 16, padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#db2777', marginBottom: '0.6rem' }}>
            <CreditCard size={18} />
            <strong style={{ color: '#2b2226' }}>Payment & Perks</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b3d43', lineHeight: 1.5 }}>
            Method: <strong>Razorpay Online (Prepaid)</strong><br />
            Transaction ID: <strong>{order.razorpayPaymentId || 'Recorded upon verification'}</strong><br />
            {order.rewardCodeApplied && (
              <span style={{ color: '#047857', display: 'block', marginTop: 4 }}>
                🎁 Reward Applied: <strong>{order.rewardCodeApplied}</strong> (One Cute Pen Free Gift)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Items Section */}
      <section style={{ background: '#ffffff', border: '1px solid #f2e2eb', borderRadius: 20, padding: '1.5rem', marginBottom: '1.8rem' }}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem' }}>Items in this Order</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {order.items?.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid #f6edf1' }}>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem' }}>{item.productName}</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#8c7b83' }}>
                  Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                  {item.mrpAtPurchase && item.mrpAtPurchase > item.unitPrice && (
                    <span style={{ textDecoration: 'line-through', marginLeft: 6 }}>
                      ₹{item.mrpAtPurchase.toLocaleString('en-IN')}
                    </span>
                  )}
                </p>

                {item.isCustomizedScoop && (
                  <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#db2777' }}>
                    🍨 {item.numberOfScoops} Scoops · Theme: {item.colourTheme || 'Surprise'}
                  </div>
                )}

                {item.isByob && item.byobDetails?.boxItems && (
                  <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#db2777' }}>
                    🎁 Custom Box: {item.byobDetails.boxItems.map((b: any) => `${b.productName} (×${b.quantity})`).join(', ')}
                  </div>
                )}
              </div>

              <strong style={{ fontSize: '0.95rem', color: '#2b2226' }}>
                ₹{item.totalPrice.toLocaleString('en-IN')}
              </strong>
            </div>
          ))}
        </div>

        {/* Pricing Math */}
        <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #f0e4ea', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 220, fontSize: '0.88rem', color: '#716269' }}>
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 220, fontSize: '0.88rem', color: '#716269' }}>
            <span>Shipping</span>
            <span>{order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount.toLocaleString('en-IN')}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 220, fontSize: '1.1rem', fontWeight: 700, color: '#2b2226', borderTop: '1px dashed #e2d1d9', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
            <span>Total</span>
            <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </section>

      {/* Transit Damage Policy Box */}
      <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 16, padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <ShieldAlert size={24} color="#db2777" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ margin: '0 0 0.2rem', color: '#9d174d', fontSize: '0.95rem' }}>Package Transit Protection</h4>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.82rem', color: '#701a75', lineHeight: 1.4 }}>
            In the event of transit damage, we offer free replacement. As per our verified policy, an uncut unboxing video is required.
          </p>
          <Link to={`/contact?orderId=${order.id}#damage-report`} style={{ fontSize: '0.82rem', fontWeight: 700, color: '#be185d', textDecoration: 'underline' }}>
            Report a Transit Damaged Item →
          </Link>
        </div>
      </div>
    </main>
  )
}

export default CustomerOrderDetails
