import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PackageSearch, ArrowLeft, RefreshCw, X } from 'lucide-react'
import { getAdminOrders, type AdminOrder } from '../../../services/adminService'
import { AdminState } from '../Dashboard/Dashboard'

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'PAID', label: 'Paid' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'REFUNDED', label: 'Refunded' },
  { id: 'FAILED', label: 'Failed' },
] as const

export function Orders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')

  const fetchOrders = (search?: string, filter?: string) => {
    setLoading(true)
    const currentFilter = filter !== undefined ? filter : activeFilter
    const currentSearch = search !== undefined ? search : searchTerm

    const params: { status?: string; paymentStatus?: string; search?: string } = {}

    if (currentFilter === 'PAID' || currentFilter === 'FAILED' || currentFilter === 'REFUNDED') {
      params.paymentStatus = currentFilter
    } else if (currentFilter !== 'ALL') {
      params.status = currentFilter
    }

    if (currentSearch.trim()) {
      params.search = currentSearch.trim()
    }

    getAdminOrders(params)
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load orders.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    fetchOrders(searchTerm, filterId)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    fetchOrders('', activeFilter)
  }

  if (loading && !orders) return <AdminState message={message || 'Loading orders...'} />

  return (
    <div className="admin-content">
      <div className="admin-page-heading" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="admin-kicker">Her Pretty Things</p>
          <h2>Order Management</h2>
          <p style={{ color: '#716269', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
            Track customer orders, payments, fulfillment, and shipments.
          </p>
        </div>

        <button
          type="button"
          className="admin-button"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          onClick={() => fetchOrders()}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ margin: '1.25rem 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8c7b83',
            }}
          />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Email, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 2.2rem 0.65rem 2.4rem',
              borderRadius: '999px',
              border: '1px solid #e0d0d8',
              fontSize: '16px',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8c7b83',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {STATUS_FILTERS.map((f) => {
            const isActive = activeFilter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterClick(f.id)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  border: isActive ? '1.5px solid #db2777' : '1px solid #e5d7df',
                  background: isActive ? '#fdf2f8' : '#ffffff',
                  color: isActive ? '#db2777' : '#574850',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders List Panel */}
      <section className="admin-panel">
        <div className="admin-table-head">
          <span>Customer</span>
          <span>Order Number</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
        </div>

        <div className="admin-table-list">
          {!orders || orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#716269' }}>
              <PackageSearch size={36} style={{ color: '#db2777', marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ fontWeight: 600, margin: '0.3rem 0' }}>No matching orders found</p>
              <small>Try adjusting your search terms or filter selection.</small>
            </div>
          ) : (
            orders.map((order) => {
              const isByob = (order.items || []).some((item: any) => item.isByob)
              const isScoop = (order.items || []).some((item: any) => item.isCustomizedScoop)

              return (
                <Link
                  className="admin-table-row"
                  to={`/admin/orders/${order.id}`}
                  key={order.id}
                >
                  <span>
                    <strong>{order.customer.name}</strong>
                    <small>{order.customer.email}</small>
                    {order.customer.phone && <small>{order.customer.phone}</small>}
                  </span>

                  <span>
                    <strong>{order.orderNumber || order.id}</strong>
                    <small>{new Date(order.createdAt).toLocaleDateString('en-IN')}</small>
                    {isByob && (
                      <span style={{ fontSize: '0.72rem', color: '#be185d', fontWeight: 600 }}>
                        🎁 BYOB Box
                      </span>
                    )}
                    {isScoop && (
                      <span style={{ fontSize: '0.72rem', color: '#db2777', fontWeight: 600 }}>
                        🍨 Mystery Scoop
                      </span>
                    )}
                  </span>

                  <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>

                  <span className={`admin-status status-${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>

                  <span className={`admin-status status-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </section>

      <Link className="admin-mobile-recent" to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
        <ArrowLeft size={15} /> Back to dashboard
      </Link>
    </div>
  )
}

export default Orders
