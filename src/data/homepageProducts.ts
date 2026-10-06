/**
 * Curated static homepage product image mapping.
 * Maps stable database product IDs (and SKUs / slugs as fallback)
 * to locally served, optimized WebP images so homepage visitors do not
 * download heavy unoptimized Cloudinary images for homepage carousels.
 */

export interface HomepageProductAsset {
  productId: string;
  sku?: string;
  slug?: string;
  image: string;
}

export const HOMEPAGE_PRODUCT_IMAGES: Record<string, string> = {
  // --- Jewellery Curated Products ---
  // Golden Textured Teardrop Earrings
  "cmudvhoe70006il1vltjmpnxz": "/images/homepage/products/jewellery-01.webp",
  // Golden Bloom Statement Cuff
  "cmudvgbyu0004il1v0x9d87j1": "/images/homepage/products/jewellery-02.webp",
  // Golden Coil Crystal Bangle
  "cmudvf46i0002il1vbxkto4ly": "/images/homepage/products/jewellery-03.webp",
  // Golden Heart Crystal Ring
  "cmudvdmnw0000il1vygfc0xxo": "/images/homepage/products/jewellery-04.webp",
  // Pink Blossom Crystal Ring
  "cmucli6jq0000h61w176ns3ne": "/images/homepage/products/jewellery-05.webp",
  // Pink Princess Ring
  "cmu748df70008eu2e7ffwf08m": "/images/homepage/products/jewellery-06.webp",

  // --- Kawaii Curated Products ---
  // Blue Bunny Hand Towel
  "cmun23gjf001ni02cmy9a56d7": "/images/homepage/products/kawaii-01.webp",
  // Red Cherry Pendant Keychain
  "cmun1vnvw001ji02cn06ssx1b": "/images/homepage/products/kawaii-02.webp",
  // Cute Bear Plush Coin Purse
  "cmun1u250001gi02csvj9xcgl": "/images/homepage/products/kawaii-03.webp",
  // Gold Cherry Charm Keychain
  "cmun1rt6b001di02c9t66du9h": "/images/homepage/products/kawaii-04.webp",
  // Purple Bow Hello Kitty Plush Keychain
  "cmun1pi0p001ai02clwkbzv2k": "/images/homepage/products/kawaii-05.webp",
  // Tiger Cat Character Hand Towel
  "cmun1nh9h0016i02c4rxjkarv": "/images/homepage/products/kawaii-06.webp",
  // Kuromi Character Hand Towel
  "cmun1kmhh0013i02cpnxhzo7t": "/images/homepage/products/kawaii-07.webp",
  // Pink Bunny Girl Hand Towel
  "cmun1j64n0010i02cb35mj4qb": "/images/homepage/products/kawaii-08.webp",
  // Shinchan Character Hand Towel
  "cmun1hfbs000wi02ceou60nld": "/images/homepage/products/kawaii-09.webp",
  // Yellow Bear Character Coin Purse Keychain
  "cmun1d7g5000pi02c50notsla": "/images/homepage/products/kawaii-10.webp",
};

/**
 * Secondary SKU-based fallback mapping in case product IDs differ between environments.
 */
export const HOMEPAGE_PRODUCT_SKU_IMAGES: Record<string, string> = {
  "HPT-JEW-001": "/images/homepage/products/jewellery-01.webp",
  "HPT-JEW-002": "/images/homepage/products/jewellery-03.webp",
  "HPT-KAW-120": "/images/homepage/products/kawaii-01.webp",
  "HPT-KAW-019": "/images/homepage/products/kawaii-02.webp",
  "HPT-KAW-018": "/images/homepage/products/kawaii-03.webp",
  "HPT-KAW-017": "/images/homepage/products/kawaii-04.webp",
  "HPT-KAW016": "/images/homepage/products/kawaii-05.webp",
  "HPT-KAW-015": "/images/homepage/products/kawaii-06.webp",
  "HPT-KAW-014": "/images/homepage/products/kawaii-07.webp",
  "HPT-KAW-013": "/images/homepage/products/kawaii-08.webp",
  "HPT-KAW-012": "/images/homepage/products/kawaii-09.webp",
  "HPT-KAW-010": "/images/homepage/products/kawaii-10.webp",
};

/**
 * Secondary Slug-based fallback mapping in case product IDs differ between environments.
 */
export const HOMEPAGE_PRODUCT_SLUG_IMAGES: Record<string, string> = {
  "golden-textured-teardrop-earrings": "/images/homepage/products/jewellery-01.webp",
  "golden-bloom-statement-cuff": "/images/homepage/products/jewellery-02.webp",
  "golden-coil-crystal-bangle": "/images/homepage/products/jewellery-03.webp",
  "golden-heart-crystal-ring": "/images/homepage/products/jewellery-04.webp",
  "pink-blossom-crystal-ring": "/images/homepage/products/jewellery-05.webp",
  "pink-princess-ring": "/images/homepage/products/jewellery-06.webp",
  "blue-bunny-hand-towel": "/images/homepage/products/kawaii-01.webp",
  "red-cherry-pendant-keychain": "/images/homepage/products/kawaii-02.webp",
  "cute-bear-plush-coin-purse": "/images/homepage/products/kawaii-03.webp",
  "gold-cherry-charm-keychain": "/images/homepage/products/kawaii-04.webp",
  "purple-bow-hello-kitty-plush-keychain": "/images/homepage/products/kawaii-05.webp",
  "tiger-cat-character-hand-towel": "/images/homepage/products/kawaii-06.webp",
  "kuromi-character-hand-towel": "/images/homepage/products/kawaii-07.webp",
  "pink-bunny-girl-hand-towel": "/images/homepage/products/kawaii-08.webp",
  "shinchan-character-hand-towel": "/images/homepage/products/kawaii-09.webp",
  "yellow-bear-character-coin-purse-keychain": "/images/homepage/products/kawaii-10.webp",
};

/**
 * Returns the curated static homepage image URL for a given product if mapped.
 */
export function getHomepageProductImage(product: {
  id?: string;
  sku?: string | null;
  slug?: string | null;
}): string | undefined {
  if (product.id && HOMEPAGE_PRODUCT_IMAGES[product.id]) {
    return HOMEPAGE_PRODUCT_IMAGES[product.id];
  }
  if (product.sku && HOMEPAGE_PRODUCT_SKU_IMAGES[product.sku]) {
    return HOMEPAGE_PRODUCT_SKU_IMAGES[product.sku];
  }
  if (product.slug && HOMEPAGE_PRODUCT_SLUG_IMAGES[product.slug]) {
    return HOMEPAGE_PRODUCT_SLUG_IMAGES[product.slug];
  }
  return undefined;
}
