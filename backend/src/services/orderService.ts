import type { Prisma } from '@prisma/client'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { calculateScoopPrice } from '../utils/pricing.js'
import type { ScoopConfigurationInput } from './cartService.js'

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
  const cart = await database.cart.findUnique({ where: { id: input.cartId }, include: { items: { include: { product: true } } } })
  if (!cart || cart.items.length === 0) throw new HttpError(400, 'Cart is empty or does not exist.')
  const totals = recalculateCart(cart.items)

  return database.$transaction(async (transaction) => {
    const address = await transaction.address.create({ data: { ...input.shipping, userId: input.userId } })
    const order = await transaction.order.create({
      data: {
        userId: input.userId, cartId: cart.id, addressId: address.id, ...totals,
        items: { create: cart.items.map((item): Prisma.OrderItemUncheckedCreateWithoutOrderInput => ({
          productId: item.productId, productName: item.product?.name ?? 'Customized Pretty Scoop', quantity: item.quantity,
          unitPrice: item.isCustomizedScoop ? calculateScoopPrice(item.numberOfScoops ?? 0).subtotal : item.unitPrice,
          totalPrice: item.isCustomizedScoop ? calculateScoopPrice(item.numberOfScoops ?? 0).subtotal * item.quantity : item.subtotal,
          isCustomizedScoop: item.isCustomizedScoop, numberOfScoops: item.numberOfScoops, colourTheme: item.colourTheme,
          preferredCharacter: item.preferredCharacter, preferredItems: item.preferredItems, excludedItems: item.excludedItems, additionalMessage: item.additionalMessage,
        })) },
      },
      include: { address: true, items: true },
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
