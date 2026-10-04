import { Prisma } from '@prisma/client'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { refundPayment } from './paymentService.js'
import { notifyNewOrder, notifyOrderCancelled } from './notificationService.js'
import { validateAndNormalizeShipping } from '../utils/addressValidation.js'
import { lookupPincode } from './pincodeService.js'
import { checkAddressConsistency } from '../utils/indiaLocations.js'

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

  const normalizedShipping = validateAndNormalizeShipping(value.shipping)

  return {
    cartId: requiredString(value.cartId, 'cartId'),
    userId: typeof value.userId === 'string' ? value.userId : undefined,
    rewardCode: typeof value.rewardCode === 'string' ? value.rewardCode.trim().toUpperCase() : undefined,
    shipping: normalizedShipping,
  }
}

async function generateOrderNumber(
  transaction: any,
): Promise<string> {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const prefix = `HPT-${year}${month}${day}-`

  // Lock order-number generation for this day's prefix if supported
  try {
    await transaction.$executeRaw`
      SELECT pg_advisory_xact_lock(
        hashtextextended(${prefix}, 0)
      )
    `
  } catch {
    // Advisory lock may not be available in dev/sqlite
  }

  const lastOrder = await transaction.order.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
    select: {
      orderNumber: true,
    },
  })

  let sequence = 1

  if (lastOrder?.orderNumber) {
    const lastSequence = Number(lastOrder.orderNumber.slice(-3))

    if (!Number.isNaN(lastSequence)) {
      sequence = lastSequence + 1
    }
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`
}

export async function createOrder(input: CreateOrderInput) {
  // Authoritative server-side pincode and consistency verification
  const postalData = await lookupPincode(input.shipping.pincode)
  if (!postalData) {
    throw new HttpError(
      400,
      `Pincode "${input.shipping.pincode}" is invalid or could not be verified by the postal registry.`,
    )
  }

  const consistency = checkAddressConsistency(
    input.shipping.state,
    input.shipping.city,
    postalData,
  )

  if (!consistency.stateMatches) {
    throw new HttpError(
      400,
      consistency.stateErrorMessage ||
        `This pincode belongs to ${postalData.state}, not ${input.shipping.state}.`,
    )
  }

  if (!consistency.cityMatches) {
    throw new HttpError(
      400,
      consistency.cityErrorMessage ||
        `The selected city "${input.shipping.city}" does not match the postal information for pincode ${input.shipping.pincode}.`,
    )
  }

  const database = getDatabase()

  const cart = await database.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, 'Cart is empty or does not exist.')
  }

  // Pre-validate stock for normal products & BYOB components
  for (const item of cart.items) {
    if (item.isCustomizedScoop) continue

    if (item.isByob) {
      const byobItems = (item.byobDetails as any)?.items || []
      for (const bItem of byobItems) {
        const prod = await database.product.findUnique({ where: { id: bItem.productId } })
        if (!prod || !prod.active) {
          throw new HttpError(400, `Item "${bItem.name}" in your BYOB box is no longer available.`)
        }
        const needed = bItem.quantity * item.quantity
        if (prod.stock < needed) {
          throw new HttpError(
            409,
            `Insufficient stock for "${prod.name}" in your BYOB box. (Requested ${needed}, available ${prod.stock})`,
          )
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
        `${item.product.name} has only ${item.product.stock} item(s) available.`,
      )
    }
  }

  // Calculate base financial totals
  let subtotal = 0
  let shippingAmount = 0

  for (const item of cart.items) {
    subtotal += item.subtotal
    shippingAmount = Math.max(shippingAmount, item.shipping)
  }

  // Reward code validation
  let rewardDiscount = 0
  let validRewardCode: string | null = null

  if (input.rewardCode && typeof input.rewardCode === 'string') {
    const code = input.rewardCode.trim().toUpperCase()
    const reward = await database.gameReward.findUnique({
      where: { code },
    }).catch(() => null)

    if (reward && reward.status === 'ACTIVE' && new Date(reward.expiresAt) > new Date()) {
      if (reward.rewardType === 'DISCOUNT_PERCENT' && reward.discountValue) {
        rewardDiscount = Math.round((subtotal * reward.discountValue) / 100)
      } else if (reward.rewardType === 'FREE_SHIPPING') {
        rewardDiscount = shippingAmount
      }
      validRewardCode = code
    }
  }

  const totalAmount = Math.max(0, subtotal + shippingAmount - rewardDiscount)

  const createdOrder = await database.$transaction(async (transaction: any) => {
    // 1. Decrement stock
    for (const item of cart.items) {
      if (item.isCustomizedScoop) continue

      if (item.isByob) {
        const byobItems = (item.byobDetails as any)?.items || []
        for (const bItem of byobItems) {
          const needed = bItem.quantity * item.quantity
          const updated = await transaction.product.updateMany({
            where: {
              id: bItem.productId,
              active: true,
              stock: { gte: needed },
            },
            data: {
              stock: { decrement: needed },
            },
          })
          if (updated.count !== 1) {
            throw new HttpError(409, `Insufficient stock for "${bItem.name}" in your BYOB box.`)
          }
        }
        continue
      }

      const updatedStock = await transaction.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      })

      if (updatedStock.count !== 1) {
        throw new HttpError(409, `Insufficient stock for ${item.product?.name}.`)
      }
    }

    // 2. Create shipping address record
    const address = await transaction.address.create({
      data: {
        ...input.shipping,
        userId: input.userId || null,
      },
    })

    // 3. Generate sequential order number
    const orderNumber = await generateOrderNumber(transaction)

    // 4. Create order snapshot with exact prices, discounts, and items
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
        orderNumber,
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
      }).catch(() => {})
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
