import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, Check, ChevronDown, Gift, Package } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getAdminOrder, updateAdminOrderStatus, type AdminOrder, type AdminOrderStatus } from '../../../services/adminService'

const statuses: AdminOrderStatus[] = ['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

function OrderDetails() {
  const { orderId } = useParams()
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [status, setStatus] = useState<AdminOrderStatus | ''>('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (orderId) {
      getAdminOrder(orderId)
        .then((result) => {
          setOrder(result)
          setStatus(result.orderStatus)
        })
        .catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Could not load order.'))
    }
  }, [orderId])

  if (!order) {
    return (
      <div className="admin-content">
        <div className="admin-state">{message || 'Loading order...'}</div>
      </div>
    )
  }

  const saveStatus = async () => {
    if (!orderId || !status || status === order.orderStatus) return
    if (!window.confirm(`Change this order to ${status.replace('_', ' ')}?`)) return
    setSaving(true)
    setMessage('')
    try {
      setOrder(await updateAdminOrderStatus(orderId, status))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update order.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-content">
      <Link className="admin-back-link" to="/admin/orders">
        <ArrowLeft size={16} /> All orders
      </Link>

      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Order details</p>
          <h2>{order.id}</h2>
          <span className="admin-date">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
        </div>

        <div className="admin-status-editor">
          <div className="admin-select-wrap">
            <select value={status} onChange={(event) => setStatus(event.target.value as AdminOrderStatus)}>
              <option value="">Choose status</option>
              {statuses.map((value) => (
                <option value={value} key={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
          <button
            className="admin-primary-button"
            type="button"
            onClick={saveStatus}
            disabled={saving || status === order.orderStatus}
          >
            {saving ? 'Saving...' : 'Update status'}
          </button>
        </div>
      </div>

      {message && <p className="admin-error">{message}</p>}

      {order.rewardCodeApplied && (
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#be185d'
        }}>
          <Gift size={24} />
          <div>
            <strong>PRETTY PLAY REWARD WINNER — INCLUDE 1x FREE CUTE PEN</strong>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9d174d' }}>
              Claim Code: <code>{order.rewardCodeApplied}</code>. Packing slip requirement: Place one complimentary Kawaii pen inside the parcel.
            </p>
          </div>
        </div>
      )}

      <div className="admin-detail-grid">
        <InfoPanel title="Customer">
          <p>
            <strong>{order.customer.name}</strong>
            <br />
            {order.customer.email}
            <br />
            {order.customer.phone}
          </p>
        </InfoPanel>

        <InfoPanel title="Shipping address">
          <p>
            {order.address.fullName}
            <br />
            {order.address.addressLine1}
            <br />
            {order.address.addressLine2 && <>{order.address.addressLine2}<br /></>}
            {order.address.city}, {order.address.state} {order.address.pincode}
            <br />
            {order.address.phoneNumber}
          </p>
        </InfoPanel>

        <InfoPanel title="Payment">
          <p>
            Status <strong>{order.paymentStatus}</strong>
            <br />
            Razorpay payment ID
            <br />
            <strong>{order.razorpayPaymentId || 'Not available'}</strong>
          </p>
        </InfoPanel>
      </div>

      <section className="admin-panel admin-order-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-kicker">Preparation</p>
            <h3>Order items</h3>
          </div>
        </div>

        {order.items.map((item) => (
          <div className="admin-item-detail" key={item.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#1e293b' }}>{item.productName}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Qty {item.quantity} · {money(item.totalPrice)} (Unit: {money(item.unitPrice)})
                  {item.mrpAtPurchase && item.mrpAtPurchase > item.unitPrice && (
                    <span style={{ marginLeft: '8px', color: '#be185d', fontSize: '12px' }}>
                      MRP {money(item.mrpAtPurchase)} · {item.discountPercent}% OFF
                    </span>
                  )}
                </p>
              </div>
            </div>

            {item.isCustomizedScoop && (
              <div className="scoop-config" style={{ marginTop: '10px' }}>
                <strong><Check size={14} /> Customized scoop · {item.numberOfScoops} scoops</strong>
                <span>Colour: {item.colourTheme || 'No preference'} · Character: {item.preferredCharacter || 'No preference'}</span>
                <span>Age: {item.age ?? 'Not provided'}</span>
                <span>Preferred: {item.preferredItems?.join(', ') || 'None'}</span>
                <span>Exclude: {item.excludedItems?.join(', ') || 'None'}</span>
                {item.additionalMessage && <span>Note: {item.additionalMessage}</span>}
              </div>
            )}

            {item.isByob && item.byobDetails && (
              <div style={{ marginTop: '12px', background: '#fdf2f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fce7f3' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be185d', marginBottom: '8px' }}>
                  <Package size={15} /> BYOB Box Contents ({item.byobDetails.items?.length || 0} items):
                </strong>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {item.byobDetails.items?.map((bi: any, bIdx: number) => (
                    <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                      {bi.image && (
                        <img src={bi.image} alt={bi.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                      )}
                      <div>
                        <strong>{bi.name}</strong> × {bi.quantity}
                        <span style={{ marginLeft: '8px', color: '#64748b' }}>({money(bi.price * bi.quantity)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="admin-totals">
          <p>Subtotal <strong>{money(order.subtotal)}</strong></p>
          <p>Shipping <strong>{money(order.shippingAmount)}</strong></p>
          {order.rewardCodeApplied && (
            <p style={{ color: '#be185d' }}>
              Free Cute Pen <strong>INCLUDED</strong>
            </p>
          )}
          <p className="admin-grand-total">Total <strong>{money(order.totalAmount)}</strong></p>
        </div>
      </section>
    </div>
  )
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="admin-info-panel">
      <p className="admin-kicker">{title}</p>
      {children}
    </section>
  )
}

export default OrderDetails
