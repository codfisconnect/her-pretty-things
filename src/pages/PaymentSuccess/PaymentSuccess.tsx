import { CheckCircle2, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

function PaymentSuccess() {
  const { orderId } = useParams()

  return (
    <section className="payment-success-page container">
      <div className="payment-success-card">
        <span className="payment-success-icon"><CheckCircle2 size={42} strokeWidth={1.5} /></span>
        <p className="eyebrow"><Sparkles size={14} /> Payment complete</p>
        <h1>Your pretty order is confirmed.</h1>
        <p>Thank you for choosing Her Pretty Things. We have received your payment and will begin preparing your order with care.</p>
        <div className="success-order-id">Order ID <strong>{orderId ?? 'Unavailable'}</strong></div>
        <Link className="button button-dark" to="/">Return home</Link>
      </div>
    </section>
  )
}

export default PaymentSuccess
