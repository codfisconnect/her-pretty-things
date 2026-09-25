import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  cancelPayment,
  createPayment,
  verifyPayment,
} from '../../services/paymentService'
import { getOrder, type OrderResponse } from '../../services/orderService'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  handler: (response: RazorpayPaymentResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (orderId) {
      getOrder(orderId)
        .then(setOrder)
        .catch((error: unknown) =>
          setMessage(
            error instanceof Error
              ? error.message
              : 'Could not load your order.',
          ),
        )
    }
  }, [orderId])

  const startPayment = async () => {
    if (!orderId) {
      setMessage('This payment link is missing an order ID.')
      return
    }
    if (!order) {
      setMessage('Your order is still loading. Please try again in a moment.')
      return
    }
    if (order.paymentStatus === 'PAID') {
      navigate(`/payment/success/${order.id}`)
      return
    }
    if (typeof window.Razorpay !== 'function') {
      setMessage('Razorpay Checkout could not load. Check your connection and refresh the page.')
      return
    }

    try {
      setIsProcessing(true)
      setMessage('Preparing secure payment...')

      const result = await createPayment(orderId)

      const razorpay = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: 'Her Pretty Things',
        description: `Order ${order.id}`,
        order_id: result.razorpayOrderId,

        prefill: {
          name: order.address.fullName,
          email: order.address.email,
          contact: order.address.phoneNumber,
        },

        theme: {
          color: '#e8a4b8',
        },

        handler: async (response) => {
          try {
            setMessage('Verifying your payment...')

            const verification = await verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            if (verification.paymentStatus !== 'PAID' || verification.orderStatus !== 'PROCESSING') {
              throw new Error('Payment was not confirmed by the server.')
            }
            navigate(`/payment/success/${order.id}`)
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : 'Payment verification failed.',
            )
          } finally {
            setIsProcessing(false)
          }
        },

        modal: {
  ondismiss: async () => {
    try {
      await cancelPayment(order.id)
      setMessage('Payment was cancelled.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Payment was cancelled, but we could not update the order.',
      )
    } finally {
      setIsProcessing(false)
    }
  },
},
      })

      razorpay.open()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start payment.',
      )
      setIsProcessing(false)
    }
  }

  if (!order) {
    return (
      <section className="placeholder-page container">
        <p className="eyebrow">Payment</p>
        <h1>Preparing your order</h1>
        <p>{message || 'Loading your order summary...'}</p>
      </section>
    )
  }

  return (
    <section className="checkout-page container">
      <p className="eyebrow">Order {order.orderNumber}</p>
      <h1>Payment</h1>

      <div className="checkout-layout">
        <div className="payment-address">
          <h2>Shipping address</h2>

          <p>
            {order.address.fullName}
            <br />
            {order.address.addressLine1}
            <br />

            {order.address.addressLine2 && (
              <>
                {order.address.addressLine2}
                <br />
              </>
            )}

            {order.address.city}, {order.address.state}{' '}
            {order.address.pincode}
            <br />
            {order.address.phoneNumber}
          </p>

          <p className="payment-status">
            Payment status: {order.paymentStatus}
          </p>
        </div>

        <aside className="checkout-summary">
          <p>
            Subtotal
            <strong>
              ₹{order.subtotal.toLocaleString('en-IN')}
            </strong>
          </p>

          <p>
            Shipping
            <strong>
              ₹{order.shippingAmount.toLocaleString('en-IN')}
            </strong>
          </p>

          <div>
            <span>Total</span>
            <strong>
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </strong>
          </div>

          <button
            className="button button-dark"
            type="button"
            onClick={startPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Preparing payment...' : 'Continue to payment'}
          </button>

          {message && <p className="scoop-notice">{message}</p>}

          <Link className="text-link" to="/">
            Return home
          </Link>
        </aside>
      </div>
    </section>
  )
}

export default Payment