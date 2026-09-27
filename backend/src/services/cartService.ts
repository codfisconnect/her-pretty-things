import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { getScoopConfig } from './scoopService.js'

export interface ScoopConfigurationInput {
  numberOfScoops: number
  age: number
  colourTheme?: string
  preferredCharacter?: string
  preferredItems?: string[]
  excludedItems?: string[]
  additionalMessage?: string
}

export interface ByobItemInput {
  productId: string
  quantity: number
}

export interface ByobBoxInput {
  items: ByobItemInput[]
}

export interface AddCartItemInput {
  cartId?: string
  sessionId?: string
  userId?: string
  productId?: string
  quantity?: number
  scoopConfiguration?: ScoopConfigurationInput
  byobBox?: ByobBoxInput
}

export interface UpdateCartItemInput {
  quantity?: number
  scoopConfiguration?: ScoopConfigurationInput
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readStringArray(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new HttpError(400, `${fieldName} must be an array of strings.`)
  }
  return value
}

export async function readAddCartItemInput(value: unknown): Promise<AddCartItemInput> {
  if (!isRecord(value)) {
    throw new HttpError(400, 'Cart item payload must be an object.')
  }

  let scoopConfiguration: ScoopConfigurationInput | undefined
  if (value.scoopConfiguration) {
    scoopConfiguration = await readScoopConfiguration(value.scoopConfiguration)
  }

  let byobBox: ByobBoxInput | undefined
  if (value.byobBox && isRecord(value.byobBox)) {
    if (!Array.isArray(value.byobBox.items) || value.byobBox.items.length === 0) {
      throw new HttpError(400, 'BYOB box must contain at least one item.')
    }
    byobBox = {
      items: value.byobBox.items.map((item: any) => ({
        productId: String(item.productId),
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
    }
  }

  return {
    cartId: typeof value.cartId === 'string' ? value.cartId : undefined,
    sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
    userId: typeof value.userId === 'string' ? value.userId : undefined,
    productId: typeof value.productId === 'string' ? value.productId : undefined,
    quantity: typeof value.quantity === 'number' ? value.quantity : undefined,
    scoopConfiguration,
    byobBox,
  }
}

export async function readUpdateCartItemInput(value: unknown): Promise<UpdateCartItemInput> {
  if (!isRecord(value)) {
    throw new HttpError(400, 'Cart item update payload must be an object.')
  }
  return {
    quantity: typeof value.quantity === 'number' ? value.quantity : undefined,
    scoopConfiguration: value.scoopConfiguration ? await readScoopConfiguration(value.scoopConfiguration) : undefined,
  }
}

async function readScoopConfiguration(value: unknown): Promise<ScoopConfigurationInput> {
  if (!isRecord(value)) {
    throw new HttpError(400, 'scoopConfiguration must be an object.')
  }

  const scoopConfig = await getScoopConfig()
  const numberOfScoops = value.numberOfScoops

  if (
    typeof numberOfScoops !== 'number' ||
    !Number.isInteger(numberOfScoops) ||
    numberOfScoops < 1 ||
    numberOfScoops > scoopConfig.limits.maxScoops
  ) {
    throw new HttpError(
      400,
      `numberOfScoops must be an integer between 1 and ${scoopConfig.limits.maxScoops}.`,
    )
  }

  const age = typeof value.age === 'number' ? value.age : 20
  const preferredItems = readStringArray(value.preferredItems, 'preferredItems')
  const excludedItems = readStringArray(value.excludedItems, 'excludedItems')

  if (preferredItems.length > scoopConfig.limits.maxPreferredItems) {
    throw new HttpError(400, `preferredItems cannot contain more than ${scoopConfig.limits.maxPreferredItems} items.`)
  }

  if (excludedItems.length > scoopConfig.limits.maxExcludedItems) {
    throw new HttpError(400, `excludedItems cannot contain more than ${scoopConfig.limits.maxExcludedItems} items.`)
  }

  if (preferredItems.some((item) => excludedItems.includes(item))) {
    throw new HttpError(400, 'preferredItems and excludedItems cannot overlap.')
  }

  return {
    numberOfScoops,
    age,
    colourTheme: typeof value.colourTheme === 'string' ? value.colourTheme : undefined,
    preferredCharacter: typeof value.preferredCharacter === 'string' ? value.preferredCharacter : undefined,
    preferredItems,
    excludedItems,
    additionalMessage: typeof value.additionalMessage === 'string' ? value.additionalMessage.slice(0, 300) : undefined,
  }
}

function validateQuantity(quantity: number | undefined): number {
  if (quantity === undefined) return 1
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new HttpError(400, 'quantity must be a positive integer.')
  }
  return quantity
}

export async function calculateCartShipping(items: any[]): Promise<number> {
  let shipping = 0

  // 1. Scoop shipping
  const totalScoops = items.reduce((sum, item) => {
    if (!item.isCustomizedScoop) return sum
    return sum + (item.numberOfScoops ?? 0) * item.quantity
  }, 0)

  if (totalScoops > 0) {
    const scoopConfig = await getScoopConfig()
    const rule = scoopConfig.shippingRules.find((r: any) => r.scoopCount === totalScoops)
    shipping += rule?.shipping ?? 150
  }

  // 2. BYOB shipping
  const hasByob = items.some((item) => item.isByob)
  if (hasByob) {
    const db = getDatabase()
    const byobSetting = await db.byobSetting.findFirst().catch(() => null)
    const byobShipping = byobSetting?.shippingFee ?? 150
    shipping += byobShipping
  }

  return shipping
}

export async function serializeCart(cart: any) {
  const items = (cart.items || []).map((item: any) => {
    const product = item.product || null
    let productDetails: any = null

    if (product) {
      const sellingPrice = Number(product.price)
      const mrp = product.mrp !== null && product.mrp !== undefined ? Number(product.mrp) : sellingPrice
      const discountAmount = mrp > sellingPrice ? mrp - sellingPrice : 0
      const discountPercent = mrp > sellingPrice && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0
      const image = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
        : (product.image || '')

      productDetails = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: sellingPrice,
        mrp,
        discountAmount,
        discountPercent,
        stock: product.stock,
        image,
      }
    }

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      shipping: item.shipping,
      total: item.total,
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
      product: productDetails,
    }
  })

  const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
  const shipping = await calculateCartShipping(items)
  const total = subtotal + shipping
  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)

  return {
    id: cart.id,
    userId: cart.userId || null,
    sessionId: cart.sessionId || null,
    items,
    itemCount,
    subtotal,
    shipping,
    total,
  }
}

export async function getCart(cartId: string) {
  const database = getDatabase()
  const cart = await database.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  })

  if (!cart) {
    throw new HttpError(404, 'Cart not found.')
  }

  return await serializeCart(cart)
}

export async function getOrCreateCart(cartId?: string, sessionId?: string, userId?: string) {
  const database = getDatabase()
  if (cartId) {
    const existing = await database.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    })
    if (existing) return await serializeCart(existing)
  }

  // Create new cart
  const newCart = await database.cart.create({
    data: {
      sessionId: sessionId || null,
      userId: userId || null,
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  })

  return await serializeCart(newCart)
}

export async function addCartItem(input: AddCartItemInput) {
  const database = getDatabase()

  // Validate only one mode is provided
  const modes = [Boolean(input.productId), Boolean(input.scoopConfiguration), Boolean(input.byobBox)].filter(Boolean)
  if (modes.length !== 1) {
    throw new HttpError(400, 'Provide exactly one of: productId, scoopConfiguration, or byobBox.')
  }

  // Find or create cart
  let cart = input.cartId
    ? await database.cart.findUnique({ where: { id: input.cartId } })
    : null

  if (!cart) {
    cart = await database.cart.create({
      data: {
        sessionId: input.sessionId || null,
        userId: input.userId || null,
      },
    })
  }

  const quantity = validateQuantity(input.quantity)

  // 1. Normal Product
  if (input.productId) {
    const product = await database.product.findUnique({
      where: { id: input.productId },
      include: { images: true },
    })

    if (!product) throw new HttpError(404, 'Product not found.')
    if (!product.active) throw new HttpError(400, 'This product is currently inactive.')
    if (product.stock <= 0) throw new HttpError(400, 'Product is out of stock.')
    if (quantity > product.stock) {
      throw new HttpError(400, `Only ${product.stock} item(s) available in stock.`)
    }

    const authoritativePrice = Number(product.price)

    // Check if product already exists in cart (normal item)
    const existingItem = await database.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        isCustomizedScoop: false,
        isByob: false,
      },
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > product.stock) {
        throw new HttpError(400, `Only ${product.stock} item(s) available in stock.`)
      }

      await database.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice: authoritativePrice,
          subtotal: authoritativePrice * newQuantity,
          total: authoritativePrice * newQuantity,
        },
      })

      return getCart(cart.id)
    }

    await database.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity,
        unitPrice: authoritativePrice,
        subtotal: authoritativePrice * quantity,
        shipping: 0,
        total: authoritativePrice * quantity,
        isCustomizedScoop: false,
        isByob: false,
        preferredItems: [],
        excludedItems: [],
      },
    })

    return getCart(cart.id)
  }

  // 2. Scoop Item
  if (input.scoopConfiguration) {
    const scoopConfig = await getScoopConfig()
    const config = input.scoopConfiguration

    const subtotal =
      scoopConfig.pricing.firstScoop +
      (config.numberOfScoops - 1) * scoopConfig.pricing.additionalScoop

    const rule = scoopConfig.shippingRules.find((r: any) => r.scoopCount === config.numberOfScoops)
    const shipping = rule?.shipping ?? 150

    await database.cartItem.create({
      data: {
        cartId: cart.id,
        quantity,
        unitPrice: subtotal,
        subtotal: subtotal * quantity,
        shipping,
        total: subtotal * quantity,
        isCustomizedScoop: true,
        isByob: false,
        numberOfScoops: config.numberOfScoops,
        age: config.age,
        colourTheme: config.colourTheme,
        preferredCharacter: config.preferredCharacter,
        preferredItems: config.preferredItems || [],
        excludedItems: config.excludedItems || [],
        additionalMessage: config.additionalMessage,
      },
    })

    return getCart(cart.id)
  }

  // 3. BYOB Box
  if (input.byobBox) {
    const boxSetting = await database.byobSetting.findFirst().catch(() => null)
    const minimumSubtotal = boxSetting?.minimumSubtotal ?? 1000
    const shippingFee = boxSetting?.shippingFee ?? 150

    let boxSubtotal = 0
    const boxDetailsItems: any[] = []

    for (const itemInput of input.byobBox.items) {
      const prod = await database.product.findUnique({
        where: { id: itemInput.productId },
        include: { images: true },
      })

      if (!prod) {
        throw new HttpError(404, `Product ${itemInput.productId} in BYOB box not found.`)
      }
      if (!prod.active) {
        throw new HttpError(400, `Product "${prod.name}" is no longer available.`)
      }
      if (!prod.byobEligible) {
        throw new HttpError(400, `Product "${prod.name}" is not eligible for Build Your Own Box.`)
      }
      const cat = (prod.category || '').trim().toLowerCase()
      if (cat !== 'kawaii' && cat !== 'jewellery' && cat !== 'jewelry') {
        throw new HttpError(400, `Only Kawaii and Jewellery products are allowed in BYOB boxes.`)
      }
      if (prod.stock < itemInput.quantity) {
        throw new HttpError(400, `Only ${prod.stock} item(s) available for "${prod.name}".`)
      }

      const itemPrice = Number(prod.price)
      const itemMrp = prod.mrp ?? itemPrice
      const lineTotal = itemPrice * itemInput.quantity
      boxSubtotal += lineTotal

      const imgUrl = Array.isArray(prod.images) && prod.images.length > 0
        ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url)
        : (prod.image || '')

      boxDetailsItems.push({
        productId: prod.id,
        name: prod.name,
        price: itemPrice,
        mrp: itemMrp,
        quantity: itemInput.quantity,
        lineTotal,
        image: imgUrl,
        category: prod.category,
      })
    }

    if (boxSubtotal < minimumSubtotal) {
      throw new HttpError(
        400,
        `Build Your Own Box requires a minimum product value of ₹${minimumSubtotal.toLocaleString('en-IN')}. Current value is ₹${boxSubtotal.toLocaleString('en-IN')}.`,
      )
    }

    await database.cartItem.create({
      data: {
        cartId: cart.id,
        quantity,
        unitPrice: boxSubtotal,
        subtotal: boxSubtotal * quantity,
        shipping: shippingFee,
        total: boxSubtotal * quantity,
        isCustomizedScoop: false,
        isByob: true,
        byobDetails: {
          items: boxDetailsItems,
          boxSubtotal,
          minimumSubtotal,
          shippingFee,
        },
        preferredItems: [],
        excludedItems: [],
      },
    })

    return getCart(cart.id)
  }

  return getCart(cart.id)
}

export async function updateCartItem(itemId: string, input: UpdateCartItemInput) {
  const database = getDatabase()
  const item = await database.cartItem.findUnique({
    where: { id: itemId },
    include: { product: true },
  })

  if (!item) throw new HttpError(404, 'Cart item not found.')

  const quantity = validateQuantity(input.quantity ?? item.quantity)

  if (item.isCustomizedScoop) {
    const config = input.scoopConfiguration || {
      numberOfScoops: item.numberOfScoops ?? 1,
      age: item.age ?? 20,
      colourTheme: item.colourTheme ?? undefined,
      preferredCharacter: item.preferredCharacter ?? undefined,
      preferredItems: item.preferredItems,
      excludedItems: item.excludedItems,
      additionalMessage: item.additionalMessage ?? undefined,
    }

    const scoopConfig = await getScoopConfig()
    const subtotal =
      scoopConfig.pricing.firstScoop +
      (config.numberOfScoops - 1) * scoopConfig.pricing.additionalScoop

    const rule = scoopConfig.shippingRules.find((r: any) => r.scoopCount === config.numberOfScoops)
    const shipping = rule?.shipping ?? 150

    await database.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        unitPrice: subtotal,
        subtotal: subtotal * quantity,
        shipping,
        total: subtotal * quantity,
        numberOfScoops: config.numberOfScoops,
        age: config.age,
        colourTheme: config.colourTheme,
        preferredCharacter: config.preferredCharacter,
        preferredItems: config.preferredItems || [],
        excludedItems: config.excludedItems || [],
        additionalMessage: config.additionalMessage,
      },
    })

    return getCart(item.cartId)
  }

  if (item.isByob) {
    const byobItems = (item.byobDetails as any)?.items || []
    for (const bItem of byobItems) {
      const prod = await database.product.findUnique({ where: { id: bItem.productId } })
      if (!prod || !prod.active) {
        throw new HttpError(400, `Item "${bItem.name}" in this box is no longer available.`)
      }
      const needed = bItem.quantity * quantity
      if (prod.stock < needed) {
        throw new HttpError(400, `Cannot increase box quantity: only ${prod.stock} unit(s) available for "${prod.name}".`)
      }
    }

    await database.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        subtotal: item.unitPrice * quantity,
        total: item.unitPrice * quantity,
      },
    })

    return getCart(item.cartId)
  }

  // Normal product - check fresh stock from database
  if (item.productId) {
    const prod = await database.product.findUnique({ where: { id: item.productId } })
    if (!prod || !prod.active) {
      throw new HttpError(400, 'Product is no longer available.')
    }
    if (quantity > prod.stock) {
      throw new HttpError(400, `Only ${prod.stock} item(s) available in stock.`)
    }
  }

  await database.cartItem.update({
    where: { id: itemId },
    data: {
      quantity,
      subtotal: item.unitPrice * quantity,
      total: item.unitPrice * quantity,
    },
  })

  return getCart(item.cartId)
}

export async function removeCartItem(itemId: string) {
  const database = getDatabase()
  const item = await database.cartItem.findUnique({
    where: { id: itemId },
  })

  if (!item) throw new HttpError(404, 'Cart item not found.')

  await database.cartItem.delete({
    where: { id: itemId },
  })

  return getCart(item.cartId)
}

export async function clearCart(cartId: string) {
  const database = getDatabase()
  await database.cartItem.deleteMany({
    where: { cartId },
  })
  return getCart(cartId)
}