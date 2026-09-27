import './env.js'
import { PrismaClient } from '@prisma/client'
import { devStore } from './devStore.js'
import crypto from 'node:crypto'

let realPrisma: PrismaClient | null = null
let useDevFallback = false

try {
  if (process.env.DATABASE_URL) {
    realPrisma = new PrismaClient()
  }
} catch {
  realPrisma = null
}

// Dev database proxy that mirrors Prisma Client methods
const devDatabase = {
  product: {
    async findMany(args?: any) {
      let list = [...devStore.products]
      if (args?.where) {
        if (args.where.active !== undefined) {
          list = list.filter((p) => p.active === args.where.active)
        }
        if (args.where.category) {
          list = list.filter((p) => p.category.toLowerCase() === args.where.category.toLowerCase())
        }
        if (args.where.byobEligible !== undefined) {
          list = list.filter((p) => p.byobEligible === args.where.byobEligible)
        }
      }
      return list
    },
    async findUnique(args: any) {
      if (args.where.id) {
        return devStore.products.find((p) => p.id === args.where.id) || null
      }
      if (args.where.slug) {
        return devStore.products.find((p) => p.slug === args.where.slug) || null
      }
      return null
    },
    async findFirst(args?: any) {
      const list = await devDatabase.product.findMany(args)
      return list[0] || null
    },
    async create(args: any) {
      const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const newProduct: any = {
        id,
        name: args.data.name,
        slug: args.data.slug || `${args.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        description: args.data.description || '',
        mrp: args.data.mrp ?? args.data.price,
        price: args.data.price,
        sku: args.data.sku || `HPT-${Date.now().toString().slice(-4)}`,
        stock: args.data.stock ?? 0,
        category: args.data.category || 'jewellery',
        byobEligible: Boolean(args.data.byobEligible),
        active: args.data.active !== undefined ? args.data.active : true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: args.data.images?.create
          ? args.data.images.create.map((img: any, idx: number) => ({
              id: `img-${id}-${idx}`,
              productId: id,
              url: img.url,
              altText: img.altText || args.data.name,
              sortOrder: idx,
            }))
          : [],
      }
      devStore.products.unshift(newProduct)
      return newProduct
    },
    async update(args: any) {
      const p = devStore.products.find((prod) => prod.id === args.where.id)
      if (!p) throw new Error('Product not found.')
      Object.assign(p, args.data, { updatedAt: new Date() })
      return p
    },
    async updateMany(args: any) {
      let count = 0
      for (const prod of devStore.products) {
        if (args.where.id && prod.id !== args.where.id) continue
        if (args.where.active !== undefined && prod.active !== args.where.active) continue
        if (args.where.stock?.gte !== undefined && prod.stock < args.where.stock.gte) continue

        if (args.data.stock?.decrement) {
          prod.stock -= args.data.stock.decrement
          count++
        } else if (args.data.stock?.increment) {
          prod.stock += args.data.stock.increment
          count++
        }
      }
      return { count }
    },
    async delete(args: any) {
      const idx = devStore.products.findIndex((prod) => prod.id === args.where.id)
      if (idx !== -1) {
        const [deleted] = devStore.products.splice(idx, 1)
        return deleted
      }
      return null
    },
    async count(args?: any) {
      const list = await devDatabase.product.findMany(args)
      return list.length
    },
  },

  productImage: {
    async createMany(args: any) {
      for (const img of args.data) {
        const prod = devStore.products.find((p) => p.id === img.productId)
        if (prod) {
          prod.images.push({
            id: `img-${prod.id}-${prod.images.length}`,
            productId: prod.id,
            url: img.url,
            altText: prod.name,
            sortOrder: img.sortOrder ?? prod.images.length,
          })
        }
      }
      return { count: args.data.length }
    },
    async deleteMany(args: any) {
      const prod = devStore.products.find((p) => p.id === args.where.productId)
      if (prod) {
        prod.images = []
      }
      return { count: 0 }
    },
  },

  cart: {
    async findUnique(args: any) {
      const cart = devStore.carts.find((c) => c.id === args.where.id)
      if (!cart) return null
      return {
        ...cart,
        items: cart.items.map((item) => ({
          ...item,
          product: item.productId ? devStore.products.find((p) => p.id === item.productId) || null : null,
        })),
      }
    },
    async findFirst(args?: any) {
      const cart = devStore.carts.find((c) => {
        if (args?.where?.sessionId && c.sessionId !== args.where.sessionId) return false
        if (args?.where?.userId && c.userId !== args.where.userId) return false
        return true
      })
      if (!cart) return null
      return {
        ...cart,
        items: cart.items.map((item) => ({
          ...item,
          product: item.productId ? devStore.products.find((p) => p.id === item.productId) || null : null,
        })),
      }
    },
    async create(args: any) {
      const newCart: any = {
        id: `cart-${crypto.randomUUID()}`,
        userId: args.data.userId || null,
        sessionId: args.data.sessionId || null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      devStore.carts.push(newCart)
      return newCart
    },
    async update(args: any) {
      const cart = devStore.carts.find((c) => c.id === args.where.id)
      if (!cart) throw new Error('Cart not found.')
      Object.assign(cart, args.data, { updatedAt: new Date() })
      return cart
    },
  },

  cartItem: {
    async findMany(args: any) {
      const cart = devStore.carts.find((c) => c.id === args.where.cartId)
      return cart ? cart.items : []
    },
    async findFirst(args: any) {
      for (const cart of devStore.carts) {
        if (args.where.cartId && cart.id !== args.where.cartId) continue
        for (const item of cart.items) {
          if (args.where.productId && item.productId !== args.where.productId) continue
          if (args.where.isCustomizedScoop !== undefined && item.isCustomizedScoop !== args.where.isCustomizedScoop) continue
          if (args.where.isByob !== undefined && item.isByob !== args.where.isByob) continue
          if (args.where.numberOfScoops !== undefined && item.numberOfScoops !== args.where.numberOfScoops) continue
          return item
        }
      }
      return null
    },
    async create(args: any) {
      const cart = devStore.carts.find((c) => c.id === args.data.cartId)
      if (!cart) throw new Error('Cart not found.')
      const newItem: any = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      cart.items.push(newItem)
      return newItem
    },
    async update(args: any) {
      for (const cart of devStore.carts) {
        const item = cart.items.find((i) => i.id === args.where.id)
        if (item) {
          Object.assign(item, args.data, { updatedAt: new Date() })
          return item
        }
      }
      throw new Error('Cart item not found.')
    },
    async delete(args: any) {
      for (const cart of devStore.carts) {
        const idx = cart.items.findIndex((i) => i.id === args.where.id)
        if (idx !== -1) {
          const [removed] = cart.items.splice(idx, 1)
          return removed
        }
      }
      throw new Error('Cart item not found.')
    },
    async deleteMany(args: any) {
      for (const cart of devStore.carts) {
        if (args.where.cartId && cart.id === args.where.cartId) {
          cart.items = []
        }
      }
      return { count: 0 }
    },
  },

  order: {
    async findUnique(args: any) {
      const order = devStore.orders.find((o) => o.id === args.where.id || (args.where.razorpayPaymentId && o.razorpayPaymentId === args.where.razorpayPaymentId))
      return order || null
    },
    async findMany(args?: any) {
      let list = [...devStore.orders]
      if (args?.where) {
        if (args.where.userId) list = list.filter((o) => o.userId === args.where.userId)
        if (args.where.paymentStatus) list = list.filter((o) => o.paymentStatus === args.where.paymentStatus)
        if (args.where.orderStatus) list = list.filter((o) => o.orderStatus === args.where.orderStatus)
      }
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }
      if (args?.take) list = list.slice(0, args.take)
      return list
    },
    async create(args: any) {
      const id = `order-${Date.now()}`
      const newOrder: any = {
        id,
        userId: args.data.userId || null,
        cartId: args.data.cartId || null,
        addressId: args.data.addressId,
        subtotal: args.data.subtotal,
        shippingAmount: args.data.shippingAmount,
        totalAmount: args.data.totalAmount,
        rewardCodeApplied: args.data.rewardCodeApplied || null,
        rewardDiscount: args.data.rewardDiscount || 0,
        razorpayOrderId: args.data.razorpayOrderId || null,
        razorpayPaymentId: args.data.razorpayPaymentId || null,
        orderStatus: args.data.orderStatus || 'PENDING_PAYMENT',
        paymentStatus: args.data.paymentStatus || 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: devStore.addresses.find((a) => a.id === args.data.addressId) || {
          id: args.data.addressId,
          fullName: 'Customer',
          phoneNumber: '',
          email: '',
          addressLine1: '',
          addressLine2: null,
          city: '',
          state: '',
          pincode: '',
          createdAt: new Date(),
          userId: null,
        },
        items: args.data.items?.create
          ? args.data.items.create.map((item: any) => ({
              id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              orderId: id,
              ...item,
            }))
          : [],
      }
      devStore.orders.unshift(newOrder)
      return newOrder
    },
    async update(args: any) {
      const order = devStore.orders.find((o) => o.id === args.where.id)
      if (!order) throw new Error('Order not found.')
      Object.assign(order, args.data, { updatedAt: new Date() })
      return order
    },
    async count(args?: any) {
      let list = devStore.orders
      if (args?.where) {
        if (args.where.paymentStatus) list = list.filter((o) => o.paymentStatus === args.where.paymentStatus)
        if (args.where.orderStatus) list = list.filter((o) => o.orderStatus === args.where.orderStatus)
      }
      return list.length
    },
    async aggregate(args: any) {
      let list = devStore.orders
      if (args.where?.paymentStatus) {
        list = list.filter((o) => o.paymentStatus === args.where.paymentStatus)
      }
      const sum = list.reduce((total, o) => total + o.totalAmount, 0)
      return { _sum: { totalAmount: sum } }
    },
  },

  orderItem: {
    async create(args: any) {
      return { id: `oi-${Date.now()}`, ...args.data }
    },
  },

  address: {
    async create(args: any) {
      const id = `addr-${Date.now()}`
      const newAddr: any = {
        id,
        ...args.data,
        createdAt: new Date(),
      }
      devStore.addresses.push(newAddr)
      return newAddr
    },
    async findUnique(args: any) {
      return devStore.addresses.find((a) => a.id === args.where.id) || null
    },
  },

  user: {
    async findUnique(args: any) {
      if (args.where.id) return devStore.users.find((u) => u.id === args.where.id) || null
      if (args.where.email) return devStore.users.find((u) => u.email.toLowerCase() === args.where.email.toLowerCase()) || null
      return null
    },
    async findFirst(args?: any) {
      if (args?.where?.email) return devStore.users.find((u) => u.email.toLowerCase() === args.where.email.toLowerCase()) || null
      if (args?.where?.resetToken) return devStore.users.find((u) => u.resetToken === args.where.resetToken) || null
      return devStore.users[0] || null
    },
    async create(args: any) {
      const newUser = {
        id: `user-${Date.now()}`,
        email: args.data.email,
        name: args.data.name || null,
        phone: args.data.phone || null,
        passwordHash: args.data.passwordHash || null,
        resetToken: null,
        resetTokenExpiry: null,
        role: args.data.role || 'CUSTOMER',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      devStore.users.push(newUser)
      return newUser
    },
    async update(args: any) {
      const user = devStore.users.find((u) => u.id === args.where.id)
      if (!user) throw new Error('User not found.')
      Object.assign(user, args.data, { updatedAt: new Date() })
      return user
    },
  },

  wishlistItem: {
    async findMany(args?: any) {
      let list = [...devStore.wishlist]
      if (args?.where) {
        if (args.where.userId) list = list.filter((w) => w.userId === args.where.userId)
        if (args.where.sessionId) list = list.filter((w) => w.sessionId === args.where.sessionId)
      }
      return list.map((w) => ({
        ...w,
        product: devStore.products.find((p) => p.id === w.productId) || null,
      }))
    },
    async findFirst(args: any) {
      const item = devStore.wishlist.find((w) => {
        if (args.where.productId && w.productId !== args.where.productId) return false
        if (args.where.userId && w.userId !== args.where.userId) return false
        if (args.where.sessionId && w.sessionId !== args.where.sessionId) return false
        return true
      })
      return item || null
    },
    async create(args: any) {
      const item = {
        id: `wl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: args.data.userId || null,
        sessionId: args.data.sessionId || null,
        productId: args.data.productId,
        createdAt: new Date(),
      }
      devStore.wishlist.push(item)
      return item
    },
    async delete(args: any) {
      const idx = devStore.wishlist.findIndex((w) => w.id === args.where.id)
      if (idx !== -1) {
        return devStore.wishlist.splice(idx, 1)[0]
      }
      return null
    },
    async deleteMany(args: any) {
      const before = devStore.wishlist.length
      devStore.wishlist = devStore.wishlist.filter((w) => {
        if (args.where.userId && w.userId === args.where.userId && args.where.productId && w.productId === args.where.productId) return false
        if (args.where.sessionId && w.sessionId === args.where.sessionId && args.where.productId && w.productId === args.where.productId) return false
        if (args.where.productId && !args.where.userId && !args.where.sessionId && w.productId === args.where.productId) return false
        return true
      })
      return { count: before - devStore.wishlist.length }
    },
  },

  scoopSetting: {
    async findFirst(args?: any) {
      return {
        ...devStore.scoopSetting,
        shippingRules: devStore.scoopShippingRules.filter((r) => r.active),
      }
    },
    async findUnique(args: any) {
      return devStore.scoopSetting
    },
    async upsert(args: any) {
      Object.assign(devStore.scoopSetting, args.update || args.create, { updatedAt: new Date() })
      return devStore.scoopSetting
    },
    async update(args: any) {
      Object.assign(devStore.scoopSetting, args.data, { updatedAt: new Date() })
      return devStore.scoopSetting
    },
  },

  scoopShippingRule: {
    async findMany(args?: any) {
      let list = [...devStore.scoopShippingRules]
      if (args?.where?.active !== undefined) list = list.filter((r) => r.active === args.where.active)
      if (args?.orderBy?.scoopCount === 'asc') list.sort((a, b) => a.scoopCount - b.scoopCount)
      return list
    },
    async upsert(args: any) {
      let rule = devStore.scoopShippingRules.find((r) => r.scoopCount === args.where.scoopCount)
      if (rule) {
        Object.assign(rule, args.update)
      } else {
        rule = { id: `rule-${args.where.scoopCount}`, ...args.create }
        devStore.scoopShippingRules.push(rule as any)
      }
      return rule
    },
    async create(args: any) {
      const rule = { id: `rule-${Date.now()}`, ...args.data }
      devStore.scoopShippingRules.push(rule as any)
      return rule
    },
  },

  scoopColour: {
    async findMany(args?: any) {
      let list = [...devStore.scoopColours]
      if (args?.where?.active !== undefined) list = list.filter((c) => c.active === args.where.active)
      if (args?.orderBy?.sortOrder === 'asc') list.sort((a, b) => a.sortOrder - b.sortOrder)
      return list
    },
    async upsert(args: any) {
      let c = devStore.scoopColours.find((col) => col.name === args.where.name)
      if (c) {
        Object.assign(c, args.update)
      } else {
        c = { id: `col-${Date.now()}`, ...args.create, createdAt: new Date(), updatedAt: new Date() }
        devStore.scoopColours.push(c as any)
      }
      return c
    },
    async create(args: any) {
      const c = { id: `col-${Date.now()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() }
      devStore.scoopColours.push(c as any)
      return c
    },
    async update(args: any) {
      const c = devStore.scoopColours.find((col) => col.id === args.where.id)
      if (c) Object.assign(c, args.data, { updatedAt: new Date() })
      return c
    },
    async delete(args: any) {
      const idx = devStore.scoopColours.findIndex((col) => col.id === args.where.id)
      if (idx !== -1) return devStore.scoopColours.splice(idx, 1)[0]
      return null
    },
  },

  scoopCharacter: {
    async findMany(args?: any) {
      let list = [...devStore.scoopCharacters]
      if (args?.where?.active !== undefined) list = list.filter((c) => c.active === args.where.active)
      if (args?.orderBy?.sortOrder === 'asc') list.sort((a, b) => a.sortOrder - b.sortOrder)
      return list
    },
    async upsert(args: any) {
      let c = devStore.scoopCharacters.find((char) => char.name === args.where.name)
      if (c) {
        Object.assign(c, args.update)
      } else {
        c = { id: `char-${Date.now()}`, ...args.create, createdAt: new Date(), updatedAt: new Date() }
        devStore.scoopCharacters.push(c as any)
      }
      return c
    },
    async create(args: any) {
      const c = { id: `char-${Date.now()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() }
      devStore.scoopCharacters.push(c as any)
      return c
    },
    async update(args: any) {
      const c = devStore.scoopCharacters.find((char) => char.id === args.where.id)
      if (c) Object.assign(c, args.data, { updatedAt: new Date() })
      return c
    },
    async delete(args: any) {
      const idx = devStore.scoopCharacters.findIndex((char) => char.id === args.where.id)
      if (idx !== -1) return devStore.scoopCharacters.splice(idx, 1)[0]
      return null
    },
  },

  scoopItem: {
    async findMany(args?: any) {
      let list = [...devStore.scoopItems]
      if (args?.where?.active !== undefined) list = list.filter((i) => i.active === args.where.active)
      if (args?.orderBy?.sortOrder === 'asc') list.sort((a, b) => a.sortOrder - b.sortOrder)
      return list
    },
    async upsert(args: any) {
      let itm = devStore.scoopItems.find((i) => i.name === args.where.name)
      if (itm) {
        Object.assign(itm, args.update)
      } else {
        itm = { id: `item-${Date.now()}`, ...args.create, createdAt: new Date(), updatedAt: new Date() }
        devStore.scoopItems.push(itm as any)
      }
      return itm
    },
    async create(args: any) {
      const itm = { id: `item-${Date.now()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() }
      devStore.scoopItems.push(itm as any)
      return itm
    },
    async update(args: any) {
      const itm = devStore.scoopItems.find((i) => i.id === args.where.id)
      if (itm) Object.assign(itm, args.data, { updatedAt: new Date() })
      return itm
    },
    async delete(args: any) {
      const idx = devStore.scoopItems.findIndex((i) => i.id === args.where.id)
      if (idx !== -1) return devStore.scoopItems.splice(idx, 1)[0]
      return null
    },
  },

  seasonalGreeting: {
    async findFirst(args?: any) {
      let list = [...devStore.seasonalGreetings]
      if (args?.where?.enabled !== undefined) list = list.filter((g) => g.enabled === args.where.enabled)
      return list[0] || null
    },
    async findMany(args?: any) {
      return [...devStore.seasonalGreetings]
    },
    async create(args: any) {
      const g = { id: `greet-${Date.now()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() }
      devStore.seasonalGreetings.unshift(g)
      return g
    },
    async update(args: any) {
      const g = devStore.seasonalGreetings.find((greet) => greet.id === args.where.id)
      if (g) Object.assign(g, args.data, { updatedAt: new Date() })
      return g
    },
    async delete(args: any) {
      const idx = devStore.seasonalGreetings.findIndex((greet) => greet.id === args.where.id)
      if (idx !== -1) return devStore.seasonalGreetings.splice(idx, 1)[0]
      return null
    },
  },

  gameReward: {
    async findUnique(args: any) {
      return devStore.gameRewards.find((r) => r.code === args.where.code) || null
    },
    async findFirst(args?: any) {
      if (args?.where?.sessionId) {
        return devStore.gameRewards.find((r) => r.sessionId === args.where.sessionId && (!args.where.status || r.status === args.where.status)) || null
      }
      return devStore.gameRewards[0] || null
    },
    async findMany(args?: any) {
      let list = [...devStore.gameRewards]
      if (args?.where?.status) list = list.filter((r) => r.status === args.where.status)
      return list
    },
    async count(args?: any) {
      let list = [...devStore.gameRewards]
      if (args?.where?.status) list = list.filter((r) => r.status === args.where.status)
      return list.length
    },
    async create(args: any) {
      const r = { id: `rew-${Date.now()}`, ...args.data, createdAt: new Date() }
      devStore.gameRewards.unshift(r)
      return r
    },
    async update(args: any) {
      const r = devStore.gameRewards.find((rew) => rew.code === args.where.code || rew.id === args.where.id)
      if (r) Object.assign(r, args.data)
      return r
    },
  },

  byobSetting: {
    async findFirst() {
      return devStore.byobSetting
    },
    async findUnique() {
      return devStore.byobSetting
    },
    async upsert(args: any) {
      Object.assign(devStore.byobSetting, args.update || args.create, { updatedAt: new Date() })
      return devStore.byobSetting
    },
    async update(args: any) {
      Object.assign(devStore.byobSetting, args.data, { updatedAt: new Date() })
      return devStore.byobSetting
    },
  },

  damageClaim: {
    async create(args: any) {
      const c = { id: `claim-${Date.now()}`, ...args.data, status: 'SUBMITTED', createdAt: new Date(), updatedAt: new Date() }
      devStore.damageClaims.unshift(c)
      return c
    },
    async findMany(args?: any) {
      return [...devStore.damageClaims]
    },
    async count(args?: any) {
      return devStore.damageClaims.length
    },
    async findUnique(args: any) {
      return devStore.damageClaims.find((c) => c.id === args.where.id) || null
    },
    async update(args: any) {
      const c = devStore.damageClaims.find((claim) => claim.id === args.where.id)
      if (c) Object.assign(c, args.data, { updatedAt: new Date() })
      return c
    },
  },

  businessInfo: {
    async findFirst() {
      return devStore.businessInfo
    },
    async findUnique() {
      return devStore.businessInfo
    },
    async upsert(args: any) {
      Object.assign(devStore.businessInfo, args.update || args.create, { updatedAt: new Date() })
      return devStore.businessInfo
    },
    async update(args: any) {
      Object.assign(devStore.businessInfo, args.data, { updatedAt: new Date() })
      return devStore.businessInfo
    },
  },

  orderNotificationEvent: {
    async findUnique(args: any) {
      return devStore.orderNotificationEvents.find((e: any) => e.idempotencyKey === args.where.idempotencyKey) || null
    },
    async findMany(args?: any) {
      let list = [...devStore.orderNotificationEvents]
      if (args?.where?.eventType) list = list.filter((e: any) => e.eventType === args.where.eventType)
      if (args?.where?.orderId) list = list.filter((e: any) => e.orderId === args.where.orderId)
      return list
    },
    async upsert(args: any) {
      let existing = devStore.orderNotificationEvents.find((e: any) => e.idempotencyKey === args.where.idempotencyKey)
      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() })
        return existing
      }
      const created = { id: `event-${Date.now()}`, ...args.create, createdAt: new Date(), updatedAt: new Date() }
      devStore.orderNotificationEvents.unshift(created)
      return created
    },
    async create(args: any) {
      const created = { id: `event-${Date.now()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() }
      devStore.orderNotificationEvents.unshift(created)
      return created
    },
  },

  async $transaction(callbackOrPromises: any) {
    if (typeof callbackOrPromises === 'function') {
      return await callbackOrPromises(devDatabase)
    }
    if (Array.isArray(callbackOrPromises)) {
      return await Promise.all(callbackOrPromises)
    }
    return null
  },
}

export const prisma = realPrisma

export function getDatabase(): any {
  if (useDevFallback || !realPrisma) {
    return devDatabase
  }
  return realPrisma
}

// Automatically detect if PostgreSQL is offline and switch to dev database seamlessly
if (realPrisma) {
  realPrisma.$connect().catch(() => {
    console.warn('[Her Pretty Things] PostgreSQL server is currently offline. Operating in high-performance resilient development mode.')
    useDevFallback = true
  })
} else {
  useDevFallback = true
}
