import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { calculateCartShipping } from './cartService.js'
import { refundPayment } from './paymentService.js'
import { notifyNewOrder, notifyOrderCancelled } from './notificationService.js'

export interface ShippingInput {
  fullName: string
  phoneNumber: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
}

export interface CreateOrderInput {
  cartId: string
  shipping: ShippingInput
  userId?: string
  rewardCode?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${fieldName} is required.`)
  }
  return value.trim()
}

export function readCreateOrderInput(value: unknown): CreateOrderInput {
  if (!isRecord(value)) throw new HttpError(400, 'Order payload must be an object.')
  if (!isRecord(value.shipping)) throw new HttpError(400, 'shipping is required.')
  const shipping = value.shipping

  return {
    cartId: requiredString(value.cartId, 'cartId'),
    userId: typeof value.userId === 'string' ? value.userId : undefined,
    rewardCode: typeof value.rewardCode === 'string' ? value.rewardCode.trim().toUpperCase() : undefined,
    shipping: {
      fullName: requiredString(shipping.fullName, 'fullName'),
      phoneNumber: requiredString(shipping.phoneNumber, 'phoneNumber'),
      email: requiredString(shipping.email, 'email'),
      addressLine1: requiredString(shipping.addressLine1, 'addressLine1'),
      addressLine2: typeof shipping.addressLine2 === 'string' ? shipping.addressLine2.trim() : undefined,
      city: requiredString(shipping.city, 'city'),
      state: requiredString(shipping.state, 'state'),
      pincode: requiredString(shipping.pincode, 'pincode'),
    },
  }
}

export async function createOrder(input: CreateOrderInput) {
  const database = getDatabase()

  const cart = await database.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: { product: true },
      },
    },
  })

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new HttpError(400, 'Cart is empty or does not exist.')
  }

  // Pre-validate stock for all items
  for (const item of cart.items) {
    if (item.isCustomizedScoop) continue

    if (item.isByob) {
      const byobItems = item.byobDetails?.items || []
      for (const bItem of byobItems) {
        const prod = await database.product.findUnique({ where: { id: bItem.productId } })
        if (!prod || !prod.active) {
          throw new HttpError(409, `Product "${bItem.name}" in your custom box is no longer available.`)
        }
        const neededQty = bItem.quantity * item.quantity
        if (prod.stock < neededQty) {
          throw new HttpError(409, `Only ${prod.stock} item(s) available for "${prod.name}" in your box.`)
        }
      }
      continue
    }

    if (!item.product) {
      throw new HttpError(400, 'Product not found.')
    }

    if (!item.product.active) {
      throw new HttpError(409, `${item.product.name} is no longer available.`)
    }

    if (item.product.stock < item.quantity) {
      throw new HttpError(
        409,
        `${item.product.name} has only ${item.product.stock} item(s) available in stock.`,
      )
    }
  }

  // Authoritative recalculation of subtotal and shipping
  let subtotal = 0
  for (const item of cart.items) {
    if (item.isCustomizedScoop) {
      subtotal += item.unitPrice * item.quantity
    } else if (item.isByob) {
      subtotal += item.unitPrice * item.quantity
    } else {
      const currentPrice = Number(item.product.price)
      subtotal += currentPrice * item.quantity
    }
  }

  const shippingAmount = await calculateCartShipping(cart.items)
  let totalAmount = subtotal + shippingAmount
  let rewardDiscount = 0
  let validRewardCode: string | null = null

  // Validate Pretty Play reward code if provided
  if (input.rewardCode) {
    const reward = await database.gameReward.findUnique({
      where: { code: input.rewardCode },
    })

    if (reward && reward.status === 'ACTIVE') {
      validRewardCode = reward.code
      // The reward is "ONE CUTE PEN AS A FREE GIFT"
      rewardDiscount = 0 // Free gift item included with order
    }
  }

  const createdOrder = await database.$transaction(async (transaction: any) => {
    // 1. Reserve stock for normal products
    for (const item of cart.items) {
      if (item.isCustomizedScoop) continue

      if (item.isByob) {
        const byobItems = item.byobDetails?.items || []
        for (const bItem of byobItems) {
          const neededQty = bItem.quantity * item.quantity
          const bRes = await transaction.product.updateMany({
            where: {
              id: bItem.productId,
              active: true,
              stock: { gte: neededQty },
            },
            data: {
              stock: { decrement: neededQty },
            },
          })
          if (bRes.count === 0) {
            throw new HttpError(400, `Insufficient stock available for BYOB item "${bItem.name}".`)
          }
        }
        continue
      }

      const res = await transaction.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      })
      if (res.count === 0) {
        throw new HttpError(400, `Insufficient stock available for "${item.product?.name || 'Product'}".`)
      }
    }

    // 2. Save address
    const address = await transaction.address.create({
      data: {
        ...input.shipping,
        userId: input.userId || null,
      },
    })

    // 3. Create order snapshot with exact prices, discounts, and items
    const orderItemsCreate = cart.items.map((item: any) => {
      if (item.isCustomizedScoop) {
        return {
          productId: null,
          productName: `Customized Surprise Scoop (${item.numberOfScoops} scoops)`,
          quantity: item.quantity,
          mrpAtPurchase: item.unitPrice,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          discountAmount: 0,
          discountPercent: 0,
          isCustomizedScoop: true,
          numberOfScoops: item.numberOfScoops,
          colourTheme: item.colourTheme,
          preferredCharacter: item.preferredCharacter,
          preferredItems: item.preferredItems,
          excludedItems: item.excludedItems,
          additionalMessage: item.additionalMessage,
          age: item.age,
          isByob: false,
          byobDetails: null,
        }
      }

      if (item.isByob) {
        return {
          productId: null,
          productName: `Custom Gift Box (BYOB - ${item.byobDetails?.items?.length || 0} items)`,
          quantity: item.quantity,
          mrpAtPurchase: item.unitPrice,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          discountAmount: 0,
          discountPercent: 0,
          isCustomizedScoop: false,
          isByob: true,
          byobDetails: item.byobDetails,
        }
      }

      const p = item.product
      const sellingPrice = Number(p.price)
      const mrp = p.mrp ?? sellingPrice
      const discAmt = mrp > sellingPrice ? mrp - sellingPrice : 0
      const discPct = mrp > sellingPrice && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0

      return {
        productId: p.id,
        productName: p.name,
        quantity: item.quantity,
        mrpAtPurchase: mrp,
        unitPrice: sellingPrice,
        totalPrice: sellingPrice * item.quantity,
        discountAmount: discAmt,
        discountPercent: discPct,
        isCustomizedScoop: false,
        isByob: false,
        byobDetails: null,
      }
    })

    const order = await transaction.order.create({
      data: {
        userId: input.userId || null,
        cartId: cart.id,
        addressId: address.id,
        subtotal,
        shippingAmount,
        totalAmount,
        rewardCodeApplied: validRewardCode,
        rewardDiscount,
        orderStatus: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        items: {
          create: orderItemsCreate,
        },
      },
      include: {
        address: true,
        items: true,
      },
    })

    // If reward code was applied, redeem it
    if (validRewardCode) {
      await transaction.gameReward.update({
        where: { code: validRewardCode },
        data: {
          status: 'REDEEMED',
          orderId: order.id,
          redeemedAt: new Date(),
        },
      })
    }

    return order
  })

  // Fire-and-forget notification (non-blocking, idempotent)
  notifyNewOrder(createdOrder).catch((err) => {
    console.error('Failed to notify new order:', err)
  })

  return createdOrder
}

export async function getOrder(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({
    where: { id: orderId },
    include: { address: true, items: true },
  })
  if (!order) throw new HttpError(404, 'Order not found.')
  return order
}

export async function listUserOrders(userId: string) {
  const database = getDatabase()
  const orders = await database.order.findMany({
    where: { userId },
    include: { address: true, items: true },
    orderBy: { createdAt: 'desc' },
  })
  return orders
}

export async function cancelOrder(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) throw new HttpError(404, 'Order not found.')
  if (order.orderStatus === 'CANCELLED') throw new HttpError(409, 'Order is already cancelled.')
  if (order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED') {
    throw new HttpError(409, 'Shipped or delivered orders cannot be cancelled.')
  }

  if (order.paymentStatus === 'PAID') {
    await refundPayment(order.id)
  }

  const cancelledOrder = await database.$transaction(async (transaction: any) => {
    // Restore stock
    for (const item of order.items) {
      if (item.isCustomizedScoop) continue

      if (item.isByob) {
        const byobItems = item.byobDetails?.items || []
        for (const bItem of byobItems) {
          const neededQty = bItem.quantity * item.quantity
          await transaction.product.updateMany({
            where: { id: bItem.productId },
            data: { stock: { increment: neededQty } },
          })
        }
        continue
      }

      if (item.productId) {
        await transaction.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }

    const updated = await transaction.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'CANCELLED',
      },
      include: {
        address: true,
        items: true,
      },
    })

    return updated
  })

  // Fire-and-forget notification (non-blocking, idempotent)
  notifyOrderCancelled(cancelledOrder, 'CUSTOMER').catch((err) => {
    console.error('Failed to notify order cancelled:', err)
  })

  return cancelledOrder
}