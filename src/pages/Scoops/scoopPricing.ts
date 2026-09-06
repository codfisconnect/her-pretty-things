const FIRST_SCOOP_PRICE = 1499
const ADDITIONAL_SCOOP_PRICE = 1299
const SCOOP_SHIPPING = 150

export function calculateScoopPrice(numberOfScoops: number): ScoopPrice {
  if (numberOfScoops < 1) {
    return { subtotal: 0, shipping: 0, total: 0, additionalScoopsTotal: 0 }
  }

  const additionalScoopsTotal = (numberOfScoops - 1) * ADDITIONAL_SCOOP_PRICE
  const subtotal = FIRST_SCOOP_PRICE + additionalScoopsTotal

  return {
    subtotal,
    shipping: SCOOP_SHIPPING,
    total: subtotal + SCOOP_SHIPPING,
    additionalScoopsTotal,
  }
}

export const scoopPricing = {
  firstScoop: FIRST_SCOOP_PRICE,
  additionalScoop: ADDITIONAL_SCOOP_PRICE,
  shipping: SCOOP_SHIPPING,
}

interface ScoopPrice {
  subtotal: number
  shipping: number
  total: number
  additionalScoopsTotal: number
}
