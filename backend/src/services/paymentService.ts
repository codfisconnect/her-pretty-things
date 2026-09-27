import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { notifyPaymentSuccess, notifyPaymentFailure, notifyRefundProcessed } from './notificationService.js'

function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  return Boolean(keyId && keyId.trim().length > 0 && keySecret && keySecret.trim().length > 0)
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new HttpError(
      500,
      'Razorpay credentials are not configured on the backend.',
    )
  }

  return {
    keyId,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  }
}

export async function createPayment(orderId: string) {
  const database = getDatabase()

  const order = await database.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new HttpError(404, 'Order not found.')
  }

  if (order.paymentStatus === 'PAID') {
    throw new HttpError(409, 'This order has already been paid.')
  }

  const expectedAmount = order.totalAmount * 100

  // If Razorpay is not configured (e.g. initial setup / development), provide safe mock payment flow
  if (!isRazorpayConfigured()) {
    const mockOrderId = `order_mock_${order.id}`
    await database.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: mockOrderId,
      },
    })

    return {
      orderId: order.id,
      razorpayOrderId: mockOrderId,
      amount: expectedAmount,
      currency: 'INR',
      keyId: 'rzp_test_mock',
      isMock: true,
    }
  }

  const { keyId, client } = getRazorpayClient()
  let razorpayOrder

  try {
    razorpayOrder = order.razorpayOrderId
      ? await client.orders.fetch(order.razorpayOrderId)
      : await client.orders.create({
          amount: expectedAmount,
          currency: 'INR',
          receipt: order.id,
          notes: {
            orderId: order.id,
          },
        })
  } catch (error) {
    console.error('Razorpay create/fetch error:', error)
    throw new HttpError(502, 'Razorpay order could not be created or retrieved.')
  }

  if (razorpayOrder.amount !== expectedAmount || razorpayOrder.currency !== 'INR') {
    throw new HttpError(
      502,
      'The Razorpay order amount does not match the database order.',
    )
  }

  if (!order.razorpayOrderId) {
    await database.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    })
  }

  return {
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId,
    isMock: false,
  }
}

export async function verifyPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  const database = getDatabase()

  const order = await database.order.findUnique({
    where: { id: orderId },
  })

  if (!order) throw new HttpError(404, 'Order not found.')

  // If in mock development mode
  if (!isRazorpayConfigured() || razorpayPaymentId.startsWith('pay_mock_')) {
    const updated = await database.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
      },
      include: { address: true, items: true },
    })

    notifyPaymentSuccess(updated, updated.razorpayPaymentId || razorpayPaymentId).catch((err) => {
      console.error('Failed to notify payment success (mock):', err)
    })

    return {
      orderId: updated.id,
      paymentStatus: updated.paymentStatus,
      orderStatus: updated.orderStatus,
      razorpayOrderId,
      razorpayPaymentId: updated.razorpayPaymentId,
    }
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET!
  const serverRazorpayOrderId = order.razorpayOrderId

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${serverRazorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const receivedBuffer = Buffer.from(razorpaySignature, 'hex')

  const isValid =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)

  if (!isValid) {
    throw new HttpError(400, 'Payment signature verification failed.')
  }

  const { client } = getRazorpayClient()
  let payment

  try {
    payment = await client.payments.fetch(razorpayPaymentId)
  } catch {
    throw new HttpError(502, 'Razorpay payment details could not be retrieved.')
  }

  if (payment.order_id !== serverRazorpayOrderId) {
    throw new HttpError(400, 'Razorpay payment does not belong to this order.')
  }

  if (payment.amount !== order.totalAmount * 100) {
    throw new HttpError(400, 'Razorpay payment amount does not match the database order.')
  }

  if (order.paymentStatus === 'PAID') {
    return {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      razorpayOrderId: serverRazorpayOrderId,
      razorpayPaymentId,
    }
  }

  const updatedOrder = await database.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      razorpayPaymentId,
    },
    include: { address: true, items: true },
  })

  notifyPaymentSuccess(updatedOrder, razorpayPaymentId).catch((err) => {
    console.error('Failed to notify payment success:', err)
  })

  return {
    orderId: updatedOrder.id,
    paymentStatus: updatedOrder.paymentStatus,
    orderStatus: updatedOrder.orderStatus,
    razorpayOrderId: serverRazorpayOrderId,
    razorpayPaymentId,
  }
}

export async function cancelPayment(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({
    where: { id: orderId },
  })

  if (!order) throw new HttpError(404, 'Order not found.')

  // Modal dismiss should NOT permanently fail the order or cancel stock.
  // We keep order in PENDING status so customer can retry payment!
  return {
    orderId: order.id,
    paymentStatus: order.paymentStatus,
    canRetry: order.paymentStatus === 'PENDING',
  }
}

export async function handleWebhook(body: Buffer, signatureHeader: string | string[] | undefined) {
  if (!isRazorpayConfigured()) return
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return

  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader
  if (!signature) throw new HttpError(400, 'Missing webhook signature.')

  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (signature !== expectedSignature) {
    throw new HttpError(400, 'Invalid webhook signature.')
  }

  const event = JSON.parse(body.toString())
  const db = getDatabase()

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const orderId = payment.notes?.orderId
    if (orderId) {
      const updated = await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'PROCESSING',
          razorpayPaymentId: payment.id,
        },
        include: { address: true, items: true },
      }).catch(() => null)

      if (updated) {
        notifyPaymentSuccess(updated, payment.id).catch((err) => {
          console.error('Failed to notify payment success (webhook):', err)
        })
      }
    }
  } else if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    const orderId = payment.notes?.orderId
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { address: true, items: true },
      }).catch(() => null)

      if (order) {
        const failureReason = payment.error_description || 'Payment authorization failed'
        notifyPaymentFailure(order, failureReason, payment.id).catch((err) => {
          console.error('Failed to notify payment failure (webhook):', err)
        })
      }
    }
  }
}

export async function refundPayment(orderId: string) {
  // If payment is paid and razorpay is configured, refund via razorpay
  if (!isRazorpayConfigured()) return
  const database = getDatabase()
  const order = await database.order.findUnique({ where: { id: orderId } })
  if (order?.razorpayPaymentId) {
    const { client } = getRazorpayClient()
    try {
      const refundResult = await client.payments.refund(order.razorpayPaymentId, {
        amount: order.totalAmount * 100,
      })
      const refunded = await database.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'REFUNDED' },
        include: { address: true, items: true },
      })
      notifyRefundProcessed(refunded, refundResult?.id || order.razorpayPaymentId, order.totalAmount).catch((err) => {
        console.error('Failed to notify refund processed:', err)
      })
    } catch (e) {
      console.error('Razorpay refund error:', e)
    }
  }
}
