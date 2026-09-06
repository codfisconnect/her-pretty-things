import { OrderStatus, PaymentStatus } from '@prisma/client'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

const orderInclude = { address: true, items: true } as const

function serializeOrder(order: Awaited<ReturnType<typeof getOrderRecord>>) {
  return {
    id: order.id,
    createdAt: order.createdAt,
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    razorpayPaymentId: order.razorpayPaymentId,
    customer: { name: order.address.fullName, email: order.address.email, phone: order.address.phoneNumber },
    address: order.address,
    items: order.items.map((item) => ({
      id: item.id, productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice,
      isCustomizedScoop: item.isCustomizedScoop, numberOfScoops: item.numberOfScoops, colourTheme: item.colourTheme,
      preferredCharacter: item.preferredCharacter, preferredItems: item.preferredItems, excludedItems: item.excludedItems, additionalMessage: item.additionalMessage,
    })),
  }
}

async function getOrderRecord(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({ where: { id: orderId }, include: orderInclude })
  if (!order) throw new HttpError(404, 'Order not found.')
  return order
}

export { getOrderRecord }

export async function getDashboard() {
  const database = getDatabase()
  const [totalOrders, pendingPayment, paidOrders, processing, shipped, delivered, revenue, recentOrders] = await Promise.all([
    database.order.count(),
    database.order.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
    database.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
    database.order.count({ where: { orderStatus: OrderStatus.PROCESSING } }),
    database.order.count({ where: { orderStatus: OrderStatus.SHIPPED } }),
    database.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
    database.order.aggregate({ where: { paymentStatus: PaymentStatus.PAID }, _sum: { totalAmount: true } }),
    database.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: orderInclude }),
  ])
  return {
    metrics: { totalOrders, pendingPayment, paidOrders, processing, shipped, delivered, revenue: revenue._sum.totalAmount ?? 0 },
    recentOrders: recentOrders.map(serializeOrder),
  }
}

export async function listOrders() {
  const database = getDatabase()
  const orders = await database.order.findMany({ orderBy: { createdAt: 'desc' }, include: orderInclude })
  return orders.map(serializeOrder)
}

export async function getOrder(orderId: string) {
  return serializeOrder(await getOrderRecord(orderId))
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!Object.values(OrderStatus).includes(status as OrderStatus)) throw new HttpError(400, 'Invalid order status.')
  const order = await getOrderRecord(orderId)
  const nextStatus = status as OrderStatus
  const fulfilmentStatuses: OrderStatus[] = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
  if (fulfilmentStatuses.includes(nextStatus) && order.paymentStatus !== PaymentStatus.PAID) {
    throw new HttpError(409, 'Only paid orders can be processed, shipped, or delivered.')
  }
  const database = getDatabase()
  const updated = await database.order.update({ where: { id: orderId }, data: { orderStatus: nextStatus }, include: orderInclude })
  return serializeOrder(updated)
}
