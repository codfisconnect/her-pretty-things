import crypto from 'node:crypto'

export interface DevProduct {
  id: string
  name: string
  slug: string
  description: string
  mrp: number | null
  price: number
  sku: string | null
  stock: number
  category: string
  byobEligible: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
  images: Array<{ id: string; productId: string; url: string; altText: string | null; sortOrder: number }>
}

export interface DevCartItem {
  id: string
  cartId: string
  productId: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  shipping: number
  total: number
  isCustomizedScoop: boolean
  numberOfScoops: number | null
  colourTheme: string | null
  preferredCharacter: string | null
  preferredItems: string[]
  excludedItems: string[]
  additionalMessage: string | null
  age: number | null
  isByob: boolean
  byobDetails: any | null
  createdAt: Date
  updatedAt: Date
  product?: DevProduct | null
}

export interface DevCart {
  id: string
  userId: string | null
  sessionId: string | null
  createdAt: Date
  updatedAt: Date
  items: DevCartItem[]
}

export interface DevAddress {
  id: string
  userId: string | null
  fullName: string
  phoneNumber: string
  email: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  createdAt: Date
}

export interface DevOrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string
  quantity: number
  mrpAtPurchase: number | null
  unitPrice: number
  totalPrice: number
  discountAmount: number | null
  discountPercent: number | null
  isCustomizedScoop: boolean
  numberOfScoops: number | null
  colourTheme: string | null
  preferredCharacter: string | null
  preferredItems: string[]
  excludedItems: string[]
  additionalMessage: string | null
  age: number | null
  isByob: boolean
  byobDetails: any | null
}

export interface DevOrder {
  id: string
  userId: string | null
  cartId: string | null
  addressId: string
  subtotal: number
  shippingAmount: number
  totalAmount: number
  rewardCodeApplied: string | null
  rewardDiscount: number
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  orderStatus: 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  createdAt: Date
  updatedAt: Date
  address: DevAddress
  items: DevOrderItem[]
}

export interface DevSeasonalGreeting {
  id: string
  enabled: boolean
  characterName: string
  characterImage: string
  greeting: string
  secondaryText: string | null
  startDate: Date | null
  endDate: Date | null
  displayFrequency: string
  animationStyle: string
  displayDuration: number
  ctaText: string | null
  ctaLink: string | null
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface DevGameReward {
  id: string
  code: string
  rewardType: string
  rewardDescription: string
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED'
  sessionId: string | null
  userId: string | null
  orderId: string | null
  difficulty: string | null
  movesCount: number | null
  createdAt: Date
  redeemedAt: Date | null
  expiresAt: Date | null
}

export interface DevByobSetting {
  id: string
  enabled: boolean
  minimumSubtotal: number
  shippingFee: number
  createdAt: Date
  updatedAt: Date
}

export interface DevDamageClaim {
  id: string
  orderNumber: string
  customerEmail: string
  customerName: string
  productName: string
  unboxingVideoUrl: string | null
  photoUrls: string[]
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface DevBusinessInfo {
  id: string
  companyName: string
  tagline: string
  email: string
  phone: string
  locationLocality: string
  locationCity: string
  locationState: string
  locationCountry: string
  instagramHandle: string
  instagramUrl: string
  businessHours: string
  createdAt: Date
  updatedAt: Date
}

class DevDataStore {
  products: DevProduct[] = []
  carts: DevCart[] = []
  orders: DevOrder[] = []
  addresses: DevAddress[] = []
  users: Array<{ id: string; email: string; name: string | null; phone: string | null; passwordHash: string | null; resetToken: string | null; resetTokenExpiry: Date | null; role: string; createdAt: Date; updatedAt: Date }> = []
  wishlist: Array<{ id: string; userId: string | null; sessionId: string | null; productId: string; createdAt: Date }> = []
  scoopSetting = {
    id: 'default-scoop-setting',
    firstScoopPrice: 1499,
    additionalScoopPrice: 1299,
    maxScoops: 10,
    maxPreferredItems: 3,
    maxExcludedItems: 3,
    active: true,
    imageUrl: 'https://res.cloudinary.com/otb2lsot/image/upload/v1790406122/her-pretty-things/products/anqebnjzsd3wrwfzvfnd.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  scoopShippingRules: Array<{ id: string; scoopCount: number; shipping: number; active: boolean; settingId: string }> = []
  scoopColours: Array<{ id: string; name: string; active: boolean; sortOrder: number; createdAt: Date; updatedAt: Date }> = []
  scoopCharacters: Array<{ id: string; name: string; active: boolean; sortOrder: number; createdAt: Date; updatedAt: Date }> = []
  scoopItems: Array<{ id: string; name: string; active: boolean; sortOrder: number; createdAt: Date; updatedAt: Date }> = []
  seasonalGreetings: DevSeasonalGreeting[] = []
  gameRewards: DevGameReward[] = []
  byobSetting: DevByobSetting = {
    id: 'default-byob-setting',
    enabled: true,
    minimumSubtotal: 1000,
    shippingFee: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  damageClaims: DevDamageClaim[] = []
  orderNotificationEvents: any[] = []
  businessInfo: DevBusinessInfo = {
    id: 'default-business-info',
    companyName: 'Her Pretty Things',
    tagline: 'Little joys, beautifully wrapped',
    email: 'shop.herprettythings@gmail.com',
    phone: '9790858125',
    locationLocality: 'Royapettah',
    locationCity: 'Chennai',
    locationState: 'Tamil Nadu',
    locationCountry: 'India',
    instagramHandle: '@her_prettythings',
    instagramUrl: 'https://www.instagram.com/her_prettythings/',
    businessHours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  constructor() {
    this.seedInitialData()
  }

  seedInitialData() {
    // Initial rich products
    const initialProducts: Array<Omit<DevProduct, 'images'> & { imageUrls: string[] }> = [
      {
        id: 'prod-jewellery-1',
        name: 'Pearl Bow Ribbon Necklace',
        slug: 'pearl-bow-ribbon-necklace',
        category: 'jewellery',
        mrp: 999,
        price: 699,
        sku: 'HPT-JW-001',
        stock: 18,
        byobEligible: true,
        active: true,
        description: 'Delicate freshwater-styled pearls accented by an exquisite handcrafted rhodium bow ribbon pendant. Tarnish resistant and perfect for everyday charm.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-jewellery-2',
        name: 'Crystal Heart Charm Bracelet',
        slug: 'crystal-heart-charm-bracelet',
        category: 'jewellery',
        mrp: 799,
        price: 499,
        sku: 'HPT-JW-002',
        stock: 24,
        byobEligible: true,
        active: true,
        description: 'Sparkling multifaceted crystal blush heart centered on a high-polish hypoallergenic cable chain. Adjustable length with signature heart tag.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1611591475878-83b63a943714?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-jewellery-3',
        name: 'Dainty Rose Quartz Ring Set',
        slug: 'dainty-rose-quartz-ring-set',
        category: 'jewellery',
        mrp: 649,
        price: 449,
        sku: 'HPT-JW-003',
        stock: 15,
        byobEligible: true,
        active: true,
        description: 'Trio stack of delicate stacking rings featuring natural rose quartz cabochon and micro pavé zircon bands.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-jewellery-4',
        name: 'Pastel Butterfly Drop Earrings',
        slug: 'pastel-butterfly-drop-earrings',
        category: 'jewellery',
        mrp: 599,
        price: 399,
        sku: 'HPT-JW-004',
        stock: 20,
        byobEligible: true,
        active: true,
        description: 'Sweet butterfly drops with iridescent wings and subtle cubic zirconia accents. Light as a feather.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-kawaii-1',
        name: 'Strawberry Milk Fluffy Plush Pouch',
        slug: 'strawberry-milk-fluffy-plush-pouch',
        category: 'kawaii',
        mrp: 699,
        price: 449,
        sku: 'HPT-KW-001',
        stock: 22,
        byobEligible: true,
        active: true,
        description: 'Super soft velvet plush cosmetic and stationery pouch with strawberry milk carton embroidery and custom pearl zipper pull.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-kawaii-2',
        name: 'Kawaii Cloud Bunny Keychain & Mirror',
        slug: 'kawaii-cloud-bunny-keychain-mirror',
        category: 'kawaii',
        mrp: 499,
        price: 299,
        sku: 'HPT-KW-002',
        stock: 30,
        byobEligible: true,
        active: true,
        description: 'Adorable cloud bunny keychain with concealed slide-out compact pocket mirror and pastel beaded loop.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-kawaii-3',
        name: 'Pastel Dream Gel Pen Set (6-Pack)',
        slug: 'pastel-dream-gel-pen-set-6pack',
        category: 'kawaii',
        mrp: 499,
        price: 349,
        sku: 'HPT-KW-003',
        stock: 35,
        byobEligible: true,
        active: true,
        description: 'Ultra-fine 0.5mm smooth-flow quick-drying gel pens in signature aesthetic pastel barrels with soft silicone grip.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1585336261026-79c09930f73b?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-kawaii-4',
        name: 'Pink Bear Mini Hardcover Journal',
        slug: 'pink-bear-mini-hardcover-journal',
        category: 'kawaii',
        mrp: 599,
        price: 399,
        sku: 'HPT-KW-004',
        stock: 14,
        byobEligible: true,
        active: true,
        description: '160-page lined journal with gilt edges, satin ribbon bookmark, and cute bear foil stamping on vegan leather.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        id: 'prod-kawaii-5',
        name: 'Sweet Bow Hair Claw & Scrunchie Duo',
        slug: 'sweet-bow-hair-claw-scrunchie-duo',
        category: 'kawaii',
        mrp: 450,
        price: 280,
        sku: 'HPT-KW-005',
        stock: 25,
        byobEligible: true,
        active: true,
        description: 'Strong-hold cellulose acetate bow hair claw accompanied by an oversized silk organza scrunchie in blush pink.',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
        ],
      },
    ]

    this.products = initialProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      mrp: p.mrp,
      price: p.price,
      sku: p.sku,
      stock: p.stock,
      category: p.category,
      byobEligible: p.byobEligible,
      active: p.active,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      images: p.imageUrls.map((url, idx) => ({
        id: `img-${p.id}-${idx}`,
        productId: p.id,
        url,
        altText: p.name,
        sortOrder: idx,
      })),
    }))

    // Shipping rules for scoops
    const calculateShipping = (scoopCount: number) => {
      if (scoopCount < 1) return 0
      if (scoopCount === 1) return 149
      let s = 149
      for (let i = 2; i <= scoopCount; i++) s += Math.max(120 - i * 10, 30)
      return s
    }

    for (let c = 1; c <= 10; c++) {
      this.scoopShippingRules.push({
        id: `rule-${c}`,
        scoopCount: c,
        shipping: calculateShipping(c),
        active: true,
        settingId: 'default-scoop-setting',
      })
    }

    const colours = ['Pink', 'Pastel', 'Purple', 'Blue', 'Yellow', 'Green', 'Mixed / Surprise']
    colours.forEach((name, idx) => {
      this.scoopColours.push({ id: `col-${idx}`, name, active: true, sortOrder: idx, createdAt: new Date(), updatedAt: new Date() })
    })

    const characters = ['Hello Kitty-inspired', 'Kuromi-inspired', 'Cute Bear', 'Bunny', 'Cinnamoroll-inspired', 'Sanrio-style', 'Surprise Me']
    characters.forEach((name, idx) => {
      this.scoopCharacters.push({ id: `char-${idx}`, name, active: true, sortOrder: idx, createdAt: new Date(), updatedAt: new Date() })
    })

    const items = [
      'Stationery Set', 'Mini Notebook', 'Hair Accessories', 'Multi-use Pouch', 'Highlighter',
      'Comb Brush', 'Multicolor Pen', 'Sticky Note', 'Jewellery', 'Squishy',
      'Cute Pen', 'Character Keychain', 'Pocket Mirror', 'Bracelet', 'Scrunchie', 'Claw Clip'
    ]
    items.forEach((name, idx) => {
      this.scoopItems.push({ id: `item-${idx}`, name, active: true, sortOrder: idx, createdAt: new Date(), updatedAt: new Date() })
    })

    // Seed Seasonal Character Greeting (Hello Kitty initial campaign)
    this.seasonalGreetings.push({
      id: 'greeting-hello-kitty',
      enabled: true,
      characterName: 'Hello Kitty',
      characterImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
      greeting: 'Hi! Welcome to Her Pretty Things ♡',
      secondaryText: 'Discover tiny delights, aesthetic jewellery, and custom curated boxes!',
      startDate: null,
      endDate: null,
      displayFrequency: 'once_per_session',
      animationStyle: 'bounce',
      displayDuration: 8,
      ctaText: 'Build Your Own Box',
      ctaLink: '/byob',
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

export const devStore = new DevDataStore()
