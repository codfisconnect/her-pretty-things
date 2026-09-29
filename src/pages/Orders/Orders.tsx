import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react'
import { listUserOrders, type OrderResponse } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import './Orders.css'

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const userOrders = await listUserOrders(user.id)
        setOrders(userOrders)
      } catch (err) {
        console.error('Failed to load user orders:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [user?.id])

  if (!isAuthenticated || !user) {
    return (
      <main className="container orders-page">
        <div className="auth-card" style={{ margin: '3rem auto', textAlign: 'center' }}>
          <h2>View Your Orders</h2>
          <p>Please log in to track your parcels and order history.</p>
          <Link to="/login" className="button button-dark" style={{ marginTop: '1rem' }}>
            Sign In
          </Link>
        </div>
      </main>
    )
  }

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase()
    if (s === 'DELIVERED') {
      return (
        <span className="order-badge delivered">
          <CheckCircle2 size={13} /> Delivered
        </span>
      )
    }
    if (s === 'SHIPPED') {
      return (
        <span className="order-badge shipped">
          <Truck size={13} /> Shipped
        </span>
      )
    }
    if (s === 'PROCESSING') {
      return (
        <span className="order-badge processing">
          <Clock size={13} /> Processing
        </span>
      )
    }
    if (s === 'CANCELLED') {
      return (
        <span className="order-badge cancelled">
          <AlertCircle size={13} /> Cancelled
        </span>
      )
    }
    return (
      <span className="order-badge pending">
        <Clock size={13} /> {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <main className="container orders-page">
      <div className="orders-header">
        <div>
          <span className="eyebrow">YOUR SHOPPING HISTORY</span>
          <h1>My Orders</h1>
        </div>
        <Link to="/profile" className="orders-back-link">
          ← Back to Profile
        </Link>
      </div>

      {loading ? (
        <div className="orders-loading">Loading your order history...</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <Package size={52} strokeWidth={1.2} />
          <h2>No orders yet</h2>
          <p>When you place an order, its details and shipment status will appear right here.</p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem' }}>
            <Link to="/scoops" className="button button-dark">
              Shop Scoops
            </Link>
            <Link to="/byob" className="button button-outline">
              Build Your Own Box
            </Link>
          </div>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <article className="order-summary-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-id-label">Order #{order.id}</span>
                    <span className="order-date-label">Placed on {dateStr}</span>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div className="order-card-middle">
                  <div className="order-info-col">
                    <span className="order-col-label">Recipient</span>
                    <span className="order-col-val">{order.address?.fullName}</span>
                  </div>
                  <div className="order-info-col">
                    <span className="order-col-label">Destination</span>
                    <span className="order-col-val">
                      {order.address?.city}, {order.address?.state}
                    </span>
                  </div>
                  <div className="order-info-col">
                    <span className="order-col-label">Total Amount</span>
                    <strong className="order-col-val price">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="order-card-footer">
                  <span className="payment-status-pill">
                    Payment: {order.paymentStatus}
                  </span>
                  <Link to={`/orders/${order.id}`} className="order-view-details-btn">
                    View Details <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Orders
