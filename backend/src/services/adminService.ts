import { OrderStatus, PaymentStatus } from '@prisma/client'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { notifyOrderStatusUpdate } from './notificationService.js'

const orderInclude = { address: true, items: true } as const

function serializeOrder(order: any) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    rewardCodeApplied: order.rewardCodeApplied || null,
    rewardDiscount: order.rewardDiscount || 0,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    razorpayPaymentId: order.razorpayPaymentId,
    customer: {
      name: order.address?.fullName || 'Customer',
      email: order.address?.email || '',
      phone: order.address?.phoneNumber || '',
    },
    address: order.address,
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      mrpAtPurchase: item.mrpAtPurchase,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      discountAmount: item.discountAmount,
      discountPercent: item.discountPercent,
      isCustomizedScoop: Boolean(item.isCustomizedScoop),
      numberOfScoops: item.numberOfScoops,
      colourTheme: item.colourTheme,
      preferredCharacter: item.preferredCharacter,
      preferredItems: item.preferredItems || [],
      excludedItems: item.excludedItems || [],
      additionalMessage: item.additionalMessage,
      age: item.age,
      isByob: Boolean(item.isByob),
      byobDetails: item.byobDetails || null,
    })),
  }
}

async function getOrderRecord(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  })
  if (!order) throw new HttpError(404, 'Order not found.')
  return order
}

export { getOrderRecord }

export async function getDashboard() {
  const database = getDatabase()

  const [
    totalOrders,
    pendingPayment,
    processing,
    shipped,
    delivered,
    cancelled,
    revenue,
    recentOrders,
    allProducts,
    allOrders,
    rewardsCount,
  ] = await Promise.all([
    database.order.count(),
    database.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
    database.order.count({ where: { orderStatus: OrderStatus.PROCESSING } }),
    database.order.count({ where: { orderStatus: OrderStatus.SHIPPED } }),
    database.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
    database.order.count({ where: { orderStatus: OrderStatus.CANCELLED } }),
    database.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { totalAmount: true },
    }),
    database.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    }),
    database.product.findMany({ where: { active: true } }),
    database.order.findMany({ include: { items: true } }),
    database.gameReward.count().catch(() => 0),
  ])

  const totalProducts = allProducts.length
  const lowStock = allProducts.filter((p: any) => p.stock > 0 && p.stock < 5).length
  const outOfStock = allProducts.filter((p: any) => p.stock === 0).length

  const byobOrders = allOrders.filter((o: any) =>
    (o.items || []).some((item: any) => item.isByob),
  ).length

  return {
    metrics: {
      totalOrders,
      pendingPayment,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue: revenue._sum.totalAmount ?? 0,
      totalProducts,
      lowStock,
      outOfStock,
      byobOrders,
      prettyPlayRewards: rewardsCount,
    },
    recentOrders: recentOrders.map(serializeOrder),
  }
}

export async function listOrders(query?: { status?: string; paymentStatus?: string; search?: string }) {
  const database = getDatabase()
  const where: any = {}

  if (query?.status && query.status !== 'ALL') {
    where.orderStatus = query.status
  }
  if (query?.paymentStatus && query.paymentStatus !== 'ALL') {
    where.paymentStatus = query.paymentStatus
  }

  const orders = await database.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: orderInclude,
  })

  let serialized = orders.map(serializeOrder)

  if (query?.search && query.search.trim()) {
    const s = query.search.trim().toLowerCase()
    serialized = serialized.filter((o: any) =>
      (o.id && o.id.toLowerCase().includes(s)) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(s)) ||
      (o.customer?.email && o.customer.email.toLowerCase().includes(s)) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(s))
    )
  }

  return serialized
}

export async function getOrder(orderId: string) {
  return serializeOrder(await getOrderRecord(orderId))
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
    throw new HttpError(400, 'Invalid order status.')
  }

  const order = await getOrderRecord(orderId)
  const nextStatus = status as OrderStatus
  const currentStatus = order.orderStatus

  if (currentStatus === OrderStatus.CANCELLED) {
    throw new HttpError(409, 'A cancelled order cannot be changed.')
  }

  if (currentStatus === OrderStatus.DELIVERED) {
    throw new HttpError(409, 'A delivered order cannot be changed.')
  }

  if (nextStatus === OrderStatus.CANCELLED) {
    throw new HttpError(400, 'Use the order cancellation endpoint to cancel an order.')
  }

  const database = getDatabase()
  const updated = await database.order.update({
    where: { id: orderId },
    data: { orderStatus: nextStatus },
    include: orderInclude,
  })

  if (currentStatus !== nextStatus) {
    notifyOrderStatusUpdate(updated, nextStatus).catch((err) => {
      console.error('Failed to notify order status update:', err)
    })
  }

  return serializeOrder(updated)
}
