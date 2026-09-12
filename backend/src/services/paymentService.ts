import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new HttpError(500, 'Razorpay test credentials are not configured on the backend.')
  return { keyId, client: new Razorpay({ key_id: keyId, key_secret: keySecret }) }
}

function validatePaymentId(value: string, fieldName: string) {
  if (!/^[A-Za-z0-9_-]{8,150}$/.test(value)) throw new HttpError(400, `${fieldName} is malformed.`)
}

function validateSignature(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new HttpError(400, 'razorpaySignature is malformed.')
}

export async function createPayment(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({ where: { id: orderId } })
  if (!order) throw new HttpError(404, 'Order not found.')
  if (order.paymentStatus === 'PAID') throw new HttpError(409, 'This order has already been paid.')

  const { keyId, client } = getRazorpayClient()
  const expectedAmount = order.totalAmount * 100
  const razorpayOrder = order.razorpayOrderId
    ? await client.orders.fetch(order.razorpayOrderId)
    : await client.orders.create({ amount: expectedAmount, currency: 'INR', receipt: order.id, notes: { orderId: order.id } })

  if (razorpayOrder.amount !== expectedAmount || razorpayOrder.currency !== 'INR') {
    throw new HttpError(502, 'The Razorpay order amount does not match the database order.')
  }
  if (!order.razorpayOrderId) {
    await database.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } })
  }

  return { orderId: order.id, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, keyId }
}

export async function verifyPayment(orderId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
  validatePaymentId(razorpayOrderId, 'razorpayOrderId')
  validatePaymentId(razorpayPaymentId, 'razorpayPaymentId')
  validateSignature(razorpaySignature)

  const database = getDatabase()
  const order = await database.order.findUnique({ where: { id: orderId } })
  if (!order) throw new HttpError(404, 'Order not found.')
  if (!order.razorpayOrderId) throw new HttpError(409, 'No Razorpay order is mapped to this database order.')
  if (order.razorpayOrderId !== razorpayOrderId) throw new HttpError(400, 'Razorpay order does not match this order.')

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) throw new HttpError(500, 'Razorpay test credentials are not configured on the backend.')
  const serverRazorpayOrderId = order.razorpayOrderId
  const expectedSignature = crypto.createHmac('sha256', keySecret).update(`${serverRazorpayOrderId}|${razorpayPaymentId}`).digest('hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const receivedBuffer = Buffer.from(razorpaySignature, 'hex')
  const isValid = expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  if (!isValid) {
    await database.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } })
    throw new HttpError(400, 'Payment signature verification failed.')
  }

  const { client } = getRazorpayClient()
  let payment
  try {
    payment = await client.payments.fetch(razorpayPaymentId)
  } catch {
    throw new HttpError(502, 'Razorpay payment details could not be retrieved.')
  }
  if (payment.order_id !== serverRazorpayOrderId) throw new HttpError(400, 'Razorpay payment does not belong to this order.')
  if (payment.amount !== order.totalAmount * 100) throw new HttpError(400, 'Razorpay payment amount does not match the database order.')
  if (payment.currency !== 'INR') throw new HttpError(400, 'Razorpay payment currency does not match the order.')
  if (payment.status !== 'captured') throw new HttpError(400, 'Razorpay payment has not been captured.')

  if (order.paymentStatus === 'PAID') {
    if (order.razorpayPaymentId === razorpayPaymentId) {
      return { orderId: order.id, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus, razorpayOrderId: serverRazorpayOrderId, razorpayPaymentId }
    }
    throw new HttpError(409, 'This order has already been paid with a different payment.')
  }
  if (order.razorpayPaymentId && order.razorpayPaymentId !== razorpayPaymentId) {
    throw new HttpError(409, 'A different payment is already recorded for this order.')
  }

  const paymentUsedElsewhere = await database.order.findFirst({ where: { razorpayPaymentId, NOT: { id: order.id } }, select: { id: true } })
  if (paymentUsedElsewhere) throw new HttpError(409, 'This payment has already been recorded for another order.')

  const claimed = await database.order.updateMany({
    where: { id: order.id, paymentStatus: 'PENDING', razorpayPaymentId: null },
    data: { paymentStatus: 'PAID', orderStatus: 'PROCESSING', razorpayPaymentId },
  })
  if (claimed.count === 0) {
    const currentOrder = await database.order.findUnique({ where: { id: order.id } })
    if (currentOrder?.paymentStatus === 'PAID' && currentOrder.razorpayPaymentId === razorpayPaymentId) {
      return { orderId: currentOrder.id, paymentStatus: currentOrder.paymentStatus, orderStatus: currentOrder.orderStatus, razorpayOrderId: serverRazorpayOrderId, razorpayPaymentId }
    }
    throw new HttpError(409, 'This order payment was changed by another request.')
  }

  const updatedOrder = await database.order.findUniqueOrThrow({ where: { id: order.id } })
  return { orderId: updatedOrder.id, paymentStatus: updatedOrder.paymentStatus, orderStatus: updatedOrder.orderStatus, razorpayOrderId: serverRazorpayOrderId, razorpayPaymentId }
}

export async function handleWebhook(rawBody: Buffer, signature: string | string[] | undefined) {
  if (!signature || Array.isArray(signature)) {
    throw new HttpError(400, 'Webhook signature is missing.')
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new HttpError(500, 'Razorpay webhook secret is not configured.')
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const receivedBuffer = Buffer.from(signature, 'hex')

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new HttpError(400, 'Webhook signature verification failed.')
  }

  let payload: any

  try {
    payload = JSON.parse(rawBody.toString('utf8'))
  } catch {
    throw new HttpError(400, 'Webhook body is invalid JSON.')
  }

  const event = payload?.event
  const paymentEntity = payload?.payload?.payment?.entity

  if (event === 'payment.captured' && paymentEntity) {
    const razorpayOrderId = paymentEntity.order_id
    const razorpayPaymentId = paymentEntity.id
    const amount = paymentEntity.amount
    const currency = paymentEntity.currency

    if (!razorpayOrderId || !razorpayPaymentId) {
      throw new HttpError(400, 'Webhook payment data is incomplete.')
    }

    const database = getDatabase()

    const order = await database.order.findFirst({
      where: { razorpayOrderId },
    })

    if (!order) {
      throw new HttpError(404, 'Order for Razorpay payment was not found.')
    }

    if (amount !== order.totalAmount * 100 || currency !== 'INR') {
      throw new HttpError(400, 'Webhook payment amount or currency does not match the order.')
    }

    if (order.paymentStatus === 'PAID') {
      return
    }

    await database.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: 'PENDING',
        razorpayPaymentId: null,
      },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        razorpayPaymentId,
      },
    })
  }

  if (event === 'payment.failed' && paymentEntity) {
    const razorpayOrderId = paymentEntity.order_id

    if (!razorpayOrderId) {
      throw new HttpError(400, 'Webhook payment data is incomplete.')
    }

    const database = getDatabase()

    await database.order.updateMany({
      where: {
        razorpayOrderId,
        paymentStatus: 'PENDING',
      },
      data: {
        paymentStatus: 'FAILED',
      },
    })
  }
}