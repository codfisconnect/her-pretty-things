import type { Product } from '../types/Product';

const baseProducts: Product[] = [
  {
    id: 'prod-01',
    name: 'Yusraa Premium Malaysian Chiffon Hijab',
    category: 'Chiffon Hijab',
    categorySlug: 'chiffon-hijab',
    slug: 'yusraa-premium-malaysian-chiffon-hijab',
    price: 1299,
    originalPrice: 1599,
    rating: 4.9,
    reviewsCount: 142,
    shortDescription: 'Crafted from authentic high-density Malaysian chiffon with a subtle grain texture, effortless drape, and airy breathability.',
    description: 'Experience the pinnacle of modest luxury with our signature Malaysian Chiffon Hijab. Carefully sourced and milled to perfection, this piece offers the ideal balance of featherlight drape and non-slip security. Breathable and gentle on hair, it transitions effortlessly from day wear to evening galas without bunching or losing structure.',
    images: [
      '/src/assets/images/yusraa-chiffon-hijab-pink.jpg',
      '/src/assets/images/yusraa-chiffon-hijab-beige.jpg',
      '/src/assets/images/yusraa-chiffon-hijab-sage.jpg',
      '/src/assets/images/yusraa-chiffon-hijab-black.jpg'
    ],
    stock: 24,
    colour: 'Dusty Rose',
    availableColours: [
      { name: 'Dusty Rose', hex: '#C49A9A', image: '/src/assets/images/yusraa-chiffon-hijab-pink.jpg' },
      { name: 'Warm Taupe', hex: '#B8A495', image: '/src/assets/images/yusraa-chiffon-hijab-beige.jpg' },
      { name: 'Sage Mist', hex: '#9EAA96', image: '/src/assets/images/yusraa-chiffon-hijab-sage.jpg' },
      { name: 'Onyx Black', hex: '#231F20', image: '/src/assets/images/yusraa-chiffon-hijab-black.jpg' }
    ],
    fabric: '100% Malaysian High-Density Chiffon',
    isBestSeller: true,
    isFeatured: true,
    details: {
      dimensions: '180 cm x 75 cm',
      careInstructions: ['Hand wash cold with mild detergent', 'Do not wring or tumble dry', 'Low heat steam iron on reverse'],
      opacity: 'Semi-sheer (opaque when doubled)',
      texture: 'Subtle crepe grain with fluid drape'
    }
  },
  {
    id: 'prod-02',
    name: 'Yusraa Premium Pashmina Hijab',
    category: 'Pashmina Hijab',
    categorySlug: 'pashmina-hijab',
    slug: 'yusraa-premium-pashmina-hijab',
    price: 1899,
    originalPrice: 2299,
    rating: 4.8,
    reviewsCount: 98,
    shortDescription: 'Woven from fine cashmere-touch pashmina fibres, offering plush thermal warmth, featherlight regal drape, and all-day non-slip comfort.',
    description: 'Woven from exquisite cashmere-touch pashmina fibres, this hijab envelops you in unparalleled warmth and regal softness. Designed for cooler seasons and distinguished occasions, featuring delicate eyelash fringe finishing and an opulent feel that stays securely pinned without extra undercaps.',
    images: [
      '/src/assets/images/yusraa-pashmina-hijab-mocha.jpg',
      '/src/assets/images/yusraa-pashmina-hijab-charcoal.jpg',
      '/src/assets/images/yusraa-pashmina-hijab-camel.jpg',
      '/src/assets/images/yusraa-pashmina-hijab-burgundy.jpg'
    ],
    stock: 18,
    colour: 'Mocha Cream',
    availableColours: [
      { name: 'Mocha Cream', hex: '#A8927F', image: '/src/assets/images/yusraa-pashmina-hijab-mocha.jpg' },
      { name: 'Rich Charcoal', hex: '#424244', image: '/src/assets/images/yusraa-pashmina-hijab-charcoal.jpg' },
      { name: 'Camel Tan', hex: '#C19A6B', image: '/src/assets/images/yusraa-pashmina-hijab-camel.jpg' },
      { name: 'Burgundy Wine', hex: '#632535', image: '/src/assets/images/yusraa-pashmina-hijab-burgundy.jpg' }
    ],
    fabric: 'Cashmere Pashmina Blend',
    isBestSeller: true,
    isFeatured: true,
    details: {
      dimensions: '190 cm x 80 cm',
      careInstructions: ['Dry clean recommended', 'Hand wash gently in lukewarm water with wool detergent', 'Dry flat in shade away from direct sunlight'],
      opacity: '100% Opaque',
      texture: 'Ultra-soft brushed wool finish with eyelash fringe'
    }
  },
  {
    id: 'prod-03',
    name: 'Yusraa Organza Shimmer Hijab',
    category: 'Organza Hijab',
    categorySlug: 'organza-hijab',
    slug: 'yusraa-organza-shimmer-hijab',
    price: 1499,
    originalPrice: 1799,
    rating: 4.7,
    reviewsCount: 65,
    shortDescription: 'A luminous celebration piece woven with delicate metallic threads, creating an ethereal glow for weddings and festive milestones.',
    description: 'Designed specifically for festive ceremonies and high-glamour evenings, the Yusraa Organza Shimmer Hijab catches the ambient light with every turn. Finished with precision-hemmed edges that hold crisp structural folds without collapsing.',
    images: [
      '/src/assets/images/yusraa-organza-hijab-champagne.jpg',
      '/src/assets/images/yusraa-organza-hijab-rosegold.jpg',
      '/src/assets/images/yusraa-organza-hijab-silver.jpg'
    ],
    stock: 15,
    colour: 'Champagne Gold',
    availableColours: [
      { name: 'Champagne Gold', hex: '#D7BA89', image: '/src/assets/images/yusraa-organza-hijab-champagne.jpg' },
      { name: 'Rose Gold', hex: '#CFA79D', image: '/src/assets/images/yusraa-organza-hijab-rosegold.jpg' },
      { name: 'Silver Slate', hex: '#B0B5B3', image: '/src/assets/images/yusraa-organza-hijab-silver.jpg' }
    ],
    fabric: 'Fine Metallic Woven Organza',
    isBestSeller: false,
    isFeatured: true,
    details: {
      dimensions: '185 cm x 70 cm',
      careInstructions: ['Spot clean or dry clean only', 'Do not rub metallic fibers vigorously', 'Cool iron with press cloth'],
      opacity: 'Semi-sheer structure with golden sheen',
      texture: 'Crisp, lightweight hold with metallic iridescence'
    }
  },
  {
    id: 'prod-04',
    name: 'Yusraa Premium Modal Hijab',
    category: 'Modal Hijab',
    categorySlug: 'modal-hijab',
    slug: 'yusraa-modal-hijab',
    price: 1199,
    originalPrice: 1399,
    rating: 4.9,
    reviewsCount: 156,
    shortDescription: 'Silky-smooth, ultra-breathable modal offering a liquid-like drape that stays impeccably in place from sunrise to sunset.',
    description: 'Spun from sustainably harvested beechwood cellulose, our 100% Modal Hijab delivers cloud-soft comfort without synthetic stiffness. Its natural thermoregulating properties keep you cool in warm weather and cosy in cooler breezes.',
    images: [
      '/src/assets/images/yusraa-modal-hijab-sand.jpg',
      '/src/assets/images/yusraa-modal-hijab-olive.jpg',
      '/src/assets/images/yusraa-modal-hijab-mauve.jpg',
      '/src/assets/images/yusraa-modal-hijab-espresso.jpg'
    ],
    stock: 30,
    colour: 'Desert Sand',
    availableColours: [
      { name: 'Desert Sand', hex: '#D2B48C', image: '/src/assets/images/yusraa-modal-hijab-sand.jpg' },
      { name: 'Soft Olive', hex: '#708238', image: '/src/assets/images/yusraa-modal-hijab-olive.jpg' },
      { name: 'Muted Mauve', hex: '#8E6F7E', image: '/src/assets/images/yusraa-modal-hijab-mauve.jpg' },
      { name: 'Rich Espresso', hex: '#3B2F2F', image: '/src/assets/images/yusraa-modal-hijab-espresso.jpg' }
    ],
    fabric: '100% Certified Lenzing Modal',
    isBestSeller: true,
    isFeatured: true,
    details: {
      dimensions: '195 cm x 85 cm',
      careInstructions: ['Machine wash gentle in laundry bag', 'Lay flat to dry', 'Steam gently on silk setting'],
      opacity: 'Opaque when draped',
      texture: 'Buttery smooth, liquid-drape modal weave'
    }
  },
  {
    id: 'prod-05',
    name: 'Yusraa Classic Silk Hijab',
    category: 'Silk Hijab',
    categorySlug: 'silk-hijab',
    slug: 'yusraa-silk-hijab',
    price: 2499,
    originalPrice: 2999,
    rating: 5.0,
    reviewsCount: 82,
    shortDescription: 'Pure mulberry silk with a lustrous sheen on one side and a matte back that stays secure without sliding.',
    description: 'The epitome of haute modesty. Crafted from grade 6A mulberry silk with rolled hand-sewn edges. Gentle on hair follicles, reducing friction, frizz, and breakage while providing an opulent glow.',
    images: [
      '/src/assets/images/yusraa-silk-hijab-emerald.jpg',
      '/src/assets/images/yusraa-silk-hijab-white.jpg',
      '/src/assets/images/yusraa-silk-hijab-navy.jpg'
    ],
    stock: 10,
    colour: 'Emerald Grace',
    availableColours: [
      { name: 'Emerald Grace', hex: '#2E5A44', image: '/src/assets/images/yusraa-silk-hijab-emerald.jpg' },
      { name: 'Pearl White', hex: '#FDFBF7', image: '/src/assets/images/yusraa-silk-hijab-white.jpg' },
      { name: 'Midnight Navy', hex: '#1C2841', image: '/src/assets/images/yusraa-silk-hijab-navy.jpg' }
    ],
    fabric: '100% Mulberry Silk Satin (19 Momme)',
    isBestSeller: false,
    isFeatured: true,
    details: {
      dimensions: '180 cm x 70 cm',
      careInstructions: ['Dry clean exclusively', 'Store flat or rolled on padded hanger', 'Never spray perfume directly on silk'],
      opacity: 'Opaque with radiant luster',
      texture: 'Silk satin front with non-slip matte twill reverse'
    }
  },
  {
    id: 'prod-06',
    name: 'Yusraa Soft Cotton Hijab',
    category: 'Cotton Hijab',
    categorySlug: 'cotton-hijab',
    slug: 'yusraa-cotton-hijab',
    price: 899,
    originalPrice: 1099,
    rating: 4.6,
    reviewsCount: 114,
    shortDescription: 'Everyday breathability meets timeless simplicity in our lightweight, non-slip combed cotton voile hijab.',
    description: 'Our organic combed cotton voile hijab is designed for non-stop comfort. Breathable, absorbent, and completely non-slip, this is your daily companion that stays put whether in lectures, errands, or morning commutes.',
    images: [
      '/src/assets/images/yusraa-cotton-hijab-olive.jpg',
      '/src/assets/images/yusraa-cotton-hijab-white.jpg',
      '/src/assets/images/yusraa-cotton-hijab-grey.jpg'
    ],
    stock: 45,
    colour: 'Olive Mist',
    availableColours: [
      { name: 'Olive Mist', hex: '#556B2F', image: '/src/assets/images/yusraa-cotton-hijab-olive.jpg' },
      { name: 'Alabaster White', hex: '#F2F0EB', image: '/src/assets/images/yusraa-cotton-hijab-white.jpg' },
      { name: 'Graphite Grey', hex: '#4B4D4F', image: '/src/assets/images/yusraa-cotton-hijab-grey.jpg' }
    ],
    fabric: '100% Organic Combed Cotton Voile',
    isBestSeller: true,
    isFeatured: false,
    details: {
      dimensions: '185 cm x 75 cm',
      careInstructions: ['Machine wash warm with similar colours', 'Tumble dry low', 'Warm iron if desired'],
      opacity: 'Opaque when styled',
      texture: 'Soft, airy voile with natural non-slip grip'
    }
  },
  {
    id: 'prod-07',
    name: 'Yusraa Egyptian Classic Jersey Hijab',
    category: 'Jersey Hijab',
    categorySlug: 'jersey-hijab',
    slug: 'yusraa-egyptian-classic-jersey-hijab',
    price: 1099,
    originalPrice: 1299,
    rating: 4.8,
    reviewsCount: 88,
    shortDescription: 'Buttery soft, pin-free convenience with premium 4-way stretch that holds shape throughout your busiest days.',
    description: 'Crafted from long-staple Egyptian cotton blended with a hint of elastane. This jersey hijab requires no pins, no underscarf, and stays completely opaque even under bright daylight.',
    images: [
      '/src/assets/images/yusraa-jersey-hijab-black.jpg',
      '/src/assets/images/yusraa-jersey-hijab-cocoa.jpg',
      '/src/assets/images/yusraa-jersey-hijab-oatmeal.jpg'
    ],
    stock: 35,
    colour: 'Onyx Black',
    availableColours: [
      { name: 'Onyx Black', hex: '#1C1C1C', image: '/src/assets/images/yusraa-jersey-hijab-black.jpg' },
      { name: 'Cocoa Brown', hex: '#5C4033', image: '/src/assets/images/yusraa-jersey-hijab-cocoa.jpg' },
      { name: 'Oatmeal Heather', hex: '#D6CFC7', image: '/src/assets/images/yusraa-jersey-hijab-oatmeal.jpg' }
    ],
    fabric: '95% Long-Staple Egyptian Cotton, 5% Spandex',
    isBestSeller: true,
    isFeatured: true,
    details: {
      dimensions: '180 cm x 70 cm',
      careInstructions: ['Machine wash warm', 'Tumble dry low', 'Iron medium if necessary'],
      opacity: '100% Completely Opaque',
      texture: '4-way stretch knit jersey with silky hand feel'
    }
  },
  {
    id: 'prod-08',
    name: 'Yusraa Everyday Chiffon Hijab',
    category: 'Chiffon Hijab',
    categorySlug: 'chiffon-hijab',
    slug: 'yusraa-everyday-chiffon-hijab',
    price: 799,
    originalPrice: 999,
    rating: 4.7,
    reviewsCount: 210,
    shortDescription: 'Lightweight, easy to care for, and wrinkle-resistant, this staple hijab is your go-to for daily ease.',
    description: 'The foundation of every modest wardrobe. Woven for everyday endurance, resisting snagging and retaining vivid colour through countless washes.',
    images: [
      '/src/assets/images/yusraa-everyday-chiffon-lavender.jpg',
      '/src/assets/images/yusraa-everyday-chiffon-black.jpg',
      '/src/assets/images/yusraa-everyday-chiffon-nude.jpg',
      '/src/assets/images/yusraa-everyday-chiffon-blue.jpg'
    ],
    stock: 50,
    colour: 'Soft Lavender',
    availableColours: [
      { name: 'Soft Lavender', hex: '#C3B1E1', image: '/src/assets/images/yusraa-everyday-chiffon-lavender.jpg' },
      { name: 'Classic Black', hex: '#111111', image: '/src/assets/images/yusraa-everyday-chiffon-black.jpg' },
      { name: 'Nude Beige', hex: '#E8D0C1', image: '/src/assets/images/yusraa-everyday-chiffon-nude.jpg' },
      { name: 'Powder Blue', hex: '#B0E0E6', image: '/src/assets/images/yusraa-everyday-chiffon-blue.jpg' }
    ],
    fabric: 'Everyday Georgette Chiffon',
    isBestSeller: true,
    isFeatured: false,
    details: {
      dimensions: '175 cm x 70 cm',
      careInstructions: ['Machine wash gentle cycle', 'Hang dry in minutes', 'Steam or iron on low'],
      opacity: 'Semi-sheer (requires doubling or undercap)',
      texture: 'Crisp georgette chiffon grain'
    }
  },
  {
    id: 'prod-09',
    name: 'Yusraa Luxury Pashmina',
    category: 'Pashmina Hijab',
    categorySlug: 'pashmina-hijab',
    slug: 'yusraa-luxury-pashmina',
    price: 2199,
    originalPrice: 2699,
    rating: 4.9,
    reviewsCount: 57,
    shortDescription: 'An heirloom-grade accessory woven with traditional Kashmiri heritage and tailored for modest royalty.',
    description: 'Hand-loomed in the valleys of Kashmir using centuries-old weaving techniques, the Yusraa Luxury Pashmina delivers unmatched thermal comfort in an astonishingly light wrap. Finished with fine hand-twisted fringes.',
    images: [
      '/src/assets/images/yusraa-lux-pashmina-maroon.jpg',
      '/src/assets/images/yusraa-lux-pashmina-teal.jpg',
      '/src/assets/images/yusraa-lux-pashmina-gold.jpg'
    ],
    stock: 12,
    colour: 'Royal Maroon',
    availableColours: [
      { name: 'Royal Maroon', hex: '#58111A', image: '/src/assets/images/yusraa-lux-pashmina-maroon.jpg' },
      { name: 'Deep Teal', hex: '#004B49', image: '/src/assets/images/yusraa-lux-pashmina-teal.jpg' },
      { name: 'Imperial Gold', hex: '#B28228', image: '/src/assets/images/yusraa-lux-pashmina-gold.jpg' }
    ],
    fabric: '100% Artisanal Kashmiri Pashmina Wool',
    isBestSeller: false,
    isFeatured: true,
    details: {
      dimensions: '200 cm x 75 cm',
      careInstructions: ['Professional dry clean recommended', 'Store with cedar blocks', 'Gentle steam only'],
      opacity: '100% Opaque',
      texture: 'Handloomed pure cashmere wool weave'
    }
  },
  {
    id: 'prod-10',
    name: 'Yusraa Pearl Hijab',
    category: 'Chiffon Hijab',
    categorySlug: 'chiffon-hijab',
    slug: 'yusraa-pearl-hijab',
    price: 1699,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 48,
    shortDescription: 'Delicately adorned along the border with lustrous hand-studded faux pearls, crafted for festive milestones.',
    description: 'Elevate your special moments. Each pearl is securely set with rust-proof backing, framing the face with an ethereal halo of shimmer.',
    images: [
      '/src/assets/images/yusraa-pearl-hijab-ivory.jpg',
      '/src/assets/images/yusraa-pearl-hijab-blush.jpg',
      '/src/assets/images/yusraa-pearl-hijab-lilac.jpg'
    ],
    stock: 14,
    colour: 'Ivory Pearl',
    availableColours: [
      { name: 'Ivory Pearl', hex: '#FFFFF0', image: '/src/assets/images/yusraa-pearl-hijab-ivory.jpg' },
      { name: 'Blush Quartz', hex: '#E6C5C5', image: '/src/assets/images/yusraa-pearl-hijab-blush.jpg' },
      { name: 'Smoky Lilac', hex: '#B5A8B2', image: '/src/assets/images/yusraa-pearl-hijab-lilac.jpg' }
    ],
    fabric: 'Korean Chiffon with Hand-Studded Pearl Border',
    isBestSeller: false,
    isFeatured: true,
    details: {
      dimensions: '180 cm x 75 cm',
      careInstructions: ['Delicate hand wash only', 'Do not squeeze pearls', 'Air dry flat away from direct heat'],
      opacity: 'Semi-sheer with pearl embellishments',
      texture: 'Fluid chiffon with secure metal-backed pearl studs'
    }
  },
  {
    id: 'prod-11',
    name: 'Yusraa Pearlmist Hijab',
    category: 'Pearlmist Hijab',
    categorySlug: 'pearlmist-hijab',
    slug: 'yusraa-pearlmist-hijab',
    price: 1399,
    originalPrice: 1699,
    rating: 4.8,
    reviewsCount: 52,
    shortDescription: 'An ethereal pearlescent weave reflecting a soft, angelic glow under ambient light, perfect for celebratory gatherings.',
    description: 'Woven with microscopic pearlescent filaments that illuminate subtly without harsh glitter. Features an ultra-soft hand feel, gentle grip, and lightweight breathability that holds gracefully from sunrise to late evening.',
    images: [
      '/src/assets/images/yusraa-pearlmist-hijab-moonlight.jpg',
      '/src/assets/images/yusraa-pearlmist-hijab-blush.jpg',
      '/src/assets/images/yusraa-pearlmist-hijab-taupe.jpg'
    ],
    stock: 22,
    colour: 'Moonlight Mist',
    availableColours: [
      { name: 'Moonlight Mist', hex: '#E2E6E7', image: '/src/assets/images/yusraa-pearlmist-hijab-moonlight.jpg' },
      { name: 'Blush Pearl', hex: '#F3E5E4', image: '/src/assets/images/yusraa-pearlmist-hijab-blush.jpg' },
      { name: 'Gilded Taupe', hex: '#D5C4B4', image: '/src/assets/images/yusraa-pearlmist-hijab-taupe.jpg' }
    ],
    fabric: 'Pearlmist Micro-Shimmer Viscose',
    isBestSeller: false,
    isFeatured: true,
    details: {
      dimensions: '185 cm x 75 cm',
      careInstructions: ['Hand wash cold with mild liquid soap', 'Lay flat to dry in shade', 'Low steam on reverse'],
      opacity: 'Semi-opaque with pearlescent sheen',
      texture: 'Silky micro-pearl texture with non-slip finish'
    }
  },
  {
    id: 'prod-12',
    name: 'Yusraa Satin Hijab',
    category: 'Satin Hijab',
    categorySlug: 'satin-hijab',
    slug: 'yusraa-satin-hijab',
    price: 1599,
    originalPrice: 1899,
    rating: 4.8,
    reviewsCount: 76,
    shortDescription: 'High-luster liquid satin with an innovative non-slip matte reverse, delivering red-carpet radiance that stays in place.',
    description: 'Experience the glamor of liquid satin without the frustration of constant slippage. Engineered specifically for formal ceremonies and celebrations, the front boasts an opulent, high-shine satin finish while the reverse features a textured matte weave that stays securely pinned to hair or undercaps.',
    images: [
      '/src/assets/images/yusraa-satin-hijab-bronze.jpg',
      '/src/assets/images/yusraa-satin-hijab-black.jpg',
      '/src/assets/images/yusraa-satin-hijab-honey.jpg'
    ],
    stock: 20,
    colour: 'Midnight Bronze',
    availableColours: [
      { name: 'Midnight Bronze', hex: '#4B3728', image: '/src/assets/images/yusraa-satin-hijab-bronze.jpg' },
      { name: 'Onyx Glamour', hex: '#1A1A1A', image: '/src/assets/images/yusraa-satin-hijab-black.jpg' },
      { name: 'Golden Honey', hex: '#D4AF37', image: '/src/assets/images/yusraa-satin-hijab-honey.jpg' }
    ],
    fabric: 'Liquid Satin with Textured Matte Reverse',
    isBestSeller: true,
    isFeatured: true,
    details: {
      dimensions: '180 cm x 70 cm',
      careInstructions: ['Hand wash gently in cold water or dry clean', 'Do not wring', 'Iron on low temperature on matte reverse side'],
      opacity: '100% Opaque',
      texture: 'High-shine front with non-slip matte backing'
    }
  },
  {
    id: 'prod-13',
    name: 'Yusraa Printed Chiffon Hijab',
    category: 'Printed Hijab',
    categorySlug: 'printed-hijabs',
    slug: 'yusraa-printed-chiffon-hijab',
    price: 1199,
    originalPrice: 1499,
    rating: 4.7,
    reviewsCount: 89,
    shortDescription: 'Artisanal Persian botanical motifs on featherweight, breathable georgette chiffon with rolled hand-sewn hems.',
    description: 'Bring effortless artistic grace to your everyday wardrobe. Features subtle botanical prints created with long-lasting reactive dyes that never fade. Semi-sheer, non-slip, and effortlessly breathable in every season.',
    images: [
      '/src/assets/images/yusraa-printed-hijab-flora.jpg',
      '/src/assets/images/yusraa-printed-hijab-marble.jpg',
      '/src/assets/images/yusraa-printed-hijab-petals.jpg'
    ],
    stock: 28,
    colour: 'Garden Flora',
    availableColours: [
      { name: 'Garden Flora', hex: '#8F9779', image: '/src/assets/images/yusraa-printed-hijab-flora.jpg' },
      { name: 'Abstract Marble', hex: '#C2B6A5', image: '/src/assets/images/yusraa-printed-hijab-marble.jpg' },
      { name: 'Vintage Petals', hex: '#D3A29D', image: '/src/assets/images/yusraa-printed-hijab-petals.jpg' }
    ],
    fabric: 'Fine Printed Georgette Chiffon',
    isBestSeller: false,
    isFeatured: true,
    details: {
      dimensions: '180 cm x 75 cm',
      careInstructions: ['Hand wash cold or gentle machine wash in mesh bag', 'Hang dry in shade', 'Light steam if needed'],
      opacity: 'Semi-sheer with rich reactive print',
      texture: 'Airy georgette with subtle crepe grain'
    }
  },
  {
    id: 'prod-14',
    name: 'Yusraa Premium Crinkle Modal Hijab',
    category: 'Modal Hijab',
    categorySlug: 'modal-hijab',
    slug: 'yusraa-premium-crinkle-hijab',
    price: 999,
    originalPrice: 1249,
    rating: 4.8,
    reviewsCount: 92,
    shortDescription: 'Effortless no-iron texture that creates voluminous styling with zero slip and unmatched comfort.',
    description: 'Featuring a permanent heat-set micro-crinkle texture, this modal hijab provides maximum volume and zero-slip styling without pins. Simply wrap, drape, and step out in effortless refinement.',
    images: [
      '/src/assets/images/yusraa-crinkle-modal-caramel.jpg',
      '/src/assets/images/yusraa-crinkle-modal-sand.jpg',
      '/src/assets/images/yusraa-crinkle-modal-green.jpg'
    ],
    stock: 28,
    colour: 'Caramel Brown',
    availableColours: [
      { name: 'Caramel Brown', hex: '#8B5A2B', image: '/src/assets/images/yusraa-crinkle-modal-caramel.jpg' },
      { name: 'Blush Sand', hex: '#E0B5A7', image: '/src/assets/images/yusraa-crinkle-modal-sand.jpg' },
      { name: 'Forest Green', hex: '#224422', image: '/src/assets/images/yusraa-crinkle-modal-green.jpg' }
    ],
    fabric: 'Textured Viscose Modal Crinkle',
    isBestSeller: false,
    isFeatured: false,
    details: {
      dimensions: '190 cm x 85 cm',
      careInstructions: ['Hand wash cold', 'Twist gently while damp to preserve crinkle', 'Do NOT iron'],
      opacity: '100% Opaque',
      texture: 'Micro-pleated textured crinkle'
    }
  }
];

export const products: Product[] = baseProducts.map(p => ({
  ...p,
  image: p.images[0],
  featured: p.isFeatured ?? false,
}));
