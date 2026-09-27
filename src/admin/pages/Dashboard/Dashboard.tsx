import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard, type AdminDashboard } from '../../../services/adminService'

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((error: unknown) =>
        setMessage(error instanceof Error ? error.message : 'Could not load dashboard.')
      )
  }, [])

  if (!data) return <AdminState message={message || 'Loading dashboard metrics...'} />

  const primaryCards = [
    ['Total Revenue', money(data.metrics.revenue), 'bg-revenue'],
    ['Total Orders', data.metrics.totalOrders, ''],
    ['Processing Orders', data.metrics.processing, ''],
    ['Shipped Orders', data.metrics.shipped, ''],
    ['Delivered Orders', data.metrics.delivered, ''],
    ['Pending Payment', data.metrics.pendingPayment, ''],
    ['Cancelled Orders', data.metrics.cancelled ?? 0, ''],
    ['Total Products', data.metrics.totalProducts ?? 0, ''],
    ['Low Stock (< 5)', data.metrics.lowStock ?? 0, 'text-warning'],
    ['Out of Stock', data.metrics.outOfStock ?? 0, 'text-danger'],
    ['BYOB Orders', data.metrics.byobOrders ?? 0, ''],
    ['Pretty Play Wins', data.metrics.prettyPlayRewards ?? 0, ''],
  ]

  return (
    <div className="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">HER PRETTY THINGS OVERVIEW</p>
          <h2>Admin Dashboard</h2>
        </div>
        <Link className="admin-outline-button" to="/admin/orders">
          View All Orders
        </Link>
      </div>

      <div className="admin-metric-grid">
        {primaryCards.map(([label, value, extraClass]) => (
          <div className={`admin-metric ${extraClass}`} key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="admin-panel" style={{ marginTop: '2rem' }}>
        <div className="admin-panel-heading">
          <div>
            <p className="admin-kicker">Latest Orders</p>
            <h3>Recent Store Activity</h3>
          </div>
          <Link to="/admin/orders">See all orders →</Link>
        </div>
        <AdminOrderRows orders={data.recentOrders} />
      </section>
    </div>
  )
}

export function AdminOrderRows({ orders }: { orders: AdminDashboard['recentOrders'] }) {
  return orders.length === 0 ? (
    <p className="admin-empty">No orders yet.</p>
  ) : (
    <div className="admin-order-list">
      {orders.map((order) => (
        <Link className="admin-order-row" to={`/admin/orders/${order.id}`} key={order.id}>
          <span>
            <strong>{order.customer.name}</strong>
            <small>
              {order.id} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </small>
          </span>
          <span>
            <strong>{money(order.totalAmount)}</strong>
            <small className={`admin-status status-${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus.replace('_', ' ')}
            </small>
          </span>
        </Link>
      ))}
    </div>
  )
}

export function AdminState({ message }: { message: string }) {
  return (
    <div className="admin-content">
      <div className="admin-state">{message}</div>
    </div>
  )
}

export default Dashboard
