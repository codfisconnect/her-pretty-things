import type { Product } from '../types/product'

export interface CategorySlide {
  url: string
  alt: string
  productName?: string
  productId?: string
}

export interface HeroSlide {
  url: string
  alt: string
  category: 'scoops' | 'jewellery' | 'kawaii' | 'general'
  productName?: string
  productId?: string
}

/**
 * Extracts all valid, usable image URLs from a product, deduplicating them.
 */
export function extractValidProductImages(product: Product): string[] {
  if (!product) return []
  const urls: string[] = []

  const addIfValid = (candidate: unknown) => {
    if (typeof candidate === 'string') {
      const clean = candidate.trim()
      if (
        clean.length > 0 &&
        !clean.toLowerCase().includes('placeholder') &&
        !urls.includes(clean)
      ) {
        urls.push(clean)
      }
    }
  }

  addIfValid(product.image)

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      addIfValid(img)
    }
  }

  return urls
}

/**
 * Builds an array of distinct category slides from product catalog data.
 * Prioritizes one image per unique product first to ensure variety before repeating products.
 */
export function getCategorySlides(
  products: Product[],
  categoryName: string,
  fallbackImage: string
): CategorySlide[] {
  const slides: CategorySlide[] = []
  const seenUrls = new Set<string>()

  // Filter products: active products with at least one valid image
  const validProducts = Array.isArray(products)
    ? products.filter(
      (p) =>
        p &&
        p.active !== false &&
        p.name &&
        !p.name.toLowerCase().includes('sample') &&
        extractValidProductImages(p).length > 0
    )
    : []

  // First pass: 1 primary image per distinct product
  for (const product of validProducts) {
    const images = extractValidProductImages(product)
    if (images.length > 0 && !seenUrls.has(images[0])) {
      seenUrls.add(images[0])
      slides.push({
        url: images[0],
        alt: `${categoryName} - ${product.name}`,
        productName: product.name,
        productId: product.id,
      })
    }
  }

  // Second pass: if few distinct products exist, pull secondary images from multi-image products
  if (slides.length < 5) {
    for (const product of validProducts) {
      const images = extractValidProductImages(product)
      for (let i = 1; i < images.length; i++) {
        if (!seenUrls.has(images[i])) {
          seenUrls.add(images[i])
          slides.push({
            url: images[i],
            alt: `${categoryName} - ${product.name} (View ${i + 1})`,
            productName: product.name,
            productId: product.id,
          })
        }
      }
    }
  }

  // Fallback if no valid products available
  if (slides.length === 0 && fallbackImage) {
    slides.push({
      url: fallbackImage,
      alt: `${categoryName} Collection`,
    })
  }

  return slides
}

/**
 * Builds the alternating hero slideshow mix:
 * Scoop -> Jewellery -> Kawaii -> Scoop -> Jewellery -> Kawaii ...
 * Automatically handles empty categories by adapting to available categories.
 */
export function buildHeroSlides(
  scoopImage: string | null | undefined,
  jewelleryProducts: Product[],
  kawaiiProducts: Product[]
): HeroSlide[] {


  const scoopSlides = getCategorySlides(
    [],
    'Mystery Scoop',
    scoopImage || ''
  ).map((s) => ({ ...s, category: 'scoops' as const }))

  const jewellerySlides = getCategorySlides(
    jewelleryProducts,
    'Jewellery',
    ''
  ).map((s) => ({ ...s, category: 'jewellery' as const }))

  const kawaiiSlides = getCategorySlides(
    kawaiiProducts,
    'Kawaii',
    ''
  ).map((s) => ({ ...s, category: 'kawaii' as const }))

  const availableStreams = [
    { cat: 'scoops', slides: scoopSlides },
    { cat: 'jewellery', slides: jewellerySlides },
    { cat: 'kawaii', slides: kawaiiSlides },
  ].filter((stream) => stream.slides.length > 0)

  if (availableStreams.length === 0) {
    return []
  }

  // Interleave round-robin across available streams (2 rounds for exactly 6 slides)
  const heroSequence: HeroSlide[] = []
  const rounds = 2

  for (let r = 0; r < rounds; r++) {
    if (scoopSlides.length > 0) {
      heroSequence.push(scoopSlides[r % scoopSlides.length])
    }
    if (jewellerySlides.length > 0) {
      heroSequence.push(jewellerySlides[r % jewellerySlides.length])
    }
    if (kawaiiSlides.length > 0) {
      heroSequence.push(kawaiiSlides[r % kawaiiSlides.length])
    }
  }

  return heroSequence
}
