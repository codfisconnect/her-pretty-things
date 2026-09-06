export const FIRST_SCOOP_PRICE = 1499
export const ADDITIONAL_SCOOP_PRICE = 1299
export const SCOOP_SHIPPING = 150

export interface ScoopPrice {
  subtotal: number
  shipping: number
  total: number
}

export function calculateScoopPrice(numberOfScoops: number): ScoopPrice {
  if (!Number.isInteger(numberOfScoops) || numberOfScoops < 1 || numberOfScoops > 10) {
    throw new Error('Number of scoops must be an integer between 1 and 10.')
  }

  const subtotal = FIRST_SCOOP_PRICE + ((numberOfScoops - 1) * ADDITIONAL_SCOOP_PRICE)
  return { subtotal, shipping: SCOOP_SHIPPING, total: subtotal + SCOOP_SHIPPING }
}
