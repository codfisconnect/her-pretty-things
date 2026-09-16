import type { Prisma } from '@prisma/client'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { calculateScoopPrice } from '../utils/pricing.js'
import type { ScoopConfigurationInput } from './cartService.js'
import { refundPayment } from './paymentService.js'

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

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }
function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new HttpError(400, `${fieldName} is required.`)
  return value.trim()
}

export interface CreateOrderInput { cartId: string; shipping: ShippingInput; userId?: string }

export function readCreateOrderInput(value: unknown): CreateOrderInput {
  if (!isRecord(value)) throw new HttpError(400, 'Order payload must be an object.')
  if (!isRecord(value.shipping)) throw new HttpError(400, 'shipping is required.')
  const shipping = value.shipping
  return {
    cartId: requiredString(value.cartId, 'cartId'),
    userId: typeof value.userId === 'string' ? value.userId : undefined,
    shipping: {
      fullName: requiredString(shipping.fullName, 'fullName'), phoneNumber: requiredString(shipping.phoneNumber, 'phoneNumber'), email: requiredString(shipping.email, 'email'),
      addressLine1: requiredString(shipping.addressLine1, 'addressLine1'), addressLine2: typeof shipping.addressLine2 === 'string' ? shipping.addressLine2.trim() : undefined,
      city: requiredString(shipping.city, 'city'), state: requiredString(shipping.state, 'state'), pincode: requiredString(shipping.pincode, 'pincode'),
    },
  }
}

function recalculateCart(items: Array<{ quantity: number; subtotal: number; isCustomizedScoop: boolean; numberOfScoops: number | null }>) {
  let subtotal = 0
  let hasScoop = false
  for (const item of items) {
    if (item.isCustomizedScoop) {
      if (item.numberOfScoops === null) throw new HttpError(400, 'Customized scoop configuration is incomplete.')
      const price = calculateScoopPrice(item.numberOfScoops)
      subtotal += price.subtotal * item.quantity
      hasScoop = true
    } else {
      subtotal += item.subtotal
    }
  }
  const shippingAmount = hasScoop ? 150 : 0
  return { subtotal, shippingAmount, totalAmount: subtotal + shippingAmount }
}

export async function createOrder(input: CreateOrderInput) {
  const database = getDatabase()
  const cart = await database.cart.findUnique({
    where: {
      id: input.cartId,
    },
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

  for (const item of cart.items) {
    if (item.isCustomizedScoop) {
      continue
    }

    if (!item.product) {
      throw new HttpError(400, 'Product not found.')
    }

    if (!item.product.active) {
      throw new HttpError(
        409,
        `${item.product.name} is no longer available.`,
      )
    }

    if (item.product.stock < item.quantity) {
      throw new HttpError(
        409,
        `${item.product.name} has only ${item.product.stock} item(s) available.`,
      )
    }
  }

  const totals = recalculateCart(cart.items)

  return database.$transaction(async (transaction) => {
    // Validate and reserve stock for normal products.
    // Customized Scoops do not use Product stock.
    for (const item of cart.items) {
      if (item.isCustomizedScoop) {
        continue
      }

      if (!item.productId || !item.product) {
        throw new HttpError(400, 'Product is missing for a cart item.')
      }

      if (!item.product.active) {
        throw new HttpError(
          409,
          `${item.product.name} is no longer available.`,
        )
      }

      const updatedStock = await transaction.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      if (updatedStock.count !== 1) {
        throw new HttpError(
          409,
          `Insufficient stock for ${item.product.name}.`,
        )
      }
    }

    const address = await transaction.address.create({
      data: {
        ...input.shipping,
        userId: input.userId,
      },
    })

    const order = await transaction.order.create({
      data: {
        userId: input.userId,
        cartId: cart.id,
        addressId: address.id,
        ...totals,
        items: {
          create: cart.items.map(
            (
              item,
            ): Prisma.OrderItemUncheckedCreateWithoutOrderInput => ({
              productId: item.productId,
              productName:
                item.product?.name ?? 'Customized Pretty Scoop',
              quantity: item.quantity,
              unitPrice: item.isCustomizedScoop
                ? calculateScoopPrice(item.numberOfScoops ?? 0).subtotal
                : item.unitPrice,
              totalPrice: item.isCustomizedScoop
                ? calculateScoopPrice(item.numberOfScoops ?? 0).subtotal *
                  item.quantity
                : item.subtotal,
              isCustomizedScoop: item.isCustomizedScoop,
              numberOfScoops: item.numberOfScoops,
              colourTheme: item.colourTheme,
              preferredCharacter: item.preferredCharacter,
              preferredItems: item.preferredItems,
              excludedItems: item.excludedItems,
              additionalMessage: item.additionalMessage,
            }),
          ),
        },
      },
      include: {
        address: true,
        items: true,
      },
    })

    return order
  })
}

export async function getOrder(orderId: string) {
  const database = getDatabase()
  const order = await database.order.findUnique({ where: { id: orderId }, include: { address: true, items: true } })
  if (!order) throw new HttpError(404, 'Order not found.')
  return order
}

export async function cancelOrder(orderId: string) {
  const database = getDatabase()

  const order = await database.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  })

  if (!order) {
    throw new HttpError(404, 'Order not found.')
  }

  if (order.orderStatus === 'CANCELLED') {
    throw new HttpError(409, 'Order is already cancelled.')
  }

  if (
    order.orderStatus === 'SHIPPED' ||
    order.orderStatus === 'DELIVERED'
  ) {
    throw new HttpError(
      409,
      'Shipped or delivered orders cannot be cancelled.',
    )
  }

  // Refund paid orders before completing cancellation.
  if (order.paymentStatus === 'PAID') {
    await refundPayment(order.id)
  }

  return database.$transaction(async (transaction) => {
    for (const item of order.items) {
      if (item.isCustomizedScoop) {
        continue
      }

      if (!item.productId) {
        throw new HttpError(
          400,
          `Product information is missing for order item ${item.id}.`,
        )
      }

      await transaction.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      })
    }

    const cancelledOrder = await transaction.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: 'CANCELLED',
      },
      include: {
        address: true,
        items: true,
      },
    })

    return cancelledOrder
  })
}