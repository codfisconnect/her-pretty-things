const FIRST_SCOOP_PRICE = 1499

const ADDITIONAL_SCOOP_PRICE = 1299

function calculateScoopShipping(numberOfScoops: number) {
  if (numberOfScoops < 1) {
    return 0
  }

  if (numberOfScoops === 1) {
    return 149
  }

  let shipping = 149

  for (let scoop = 2; scoop <= numberOfScoops; scoop++) {
    const increase = Math.max(120 - scoop * 10, 30)
    shipping += increase
  }

  return shipping
}

export function calculateScoopPrice(numberOfScoops: number): ScoopPrice {
  if (numberOfScoops < 1) {
    return {
      subtotal: 0,
      shipping: 0,
      total: 0,
      additionalScoopsTotal: 0,
    }
  }

  const additionalScoopsTotal =
    (numberOfScoops - 1) * ADDITIONAL_SCOOP_PRICE

  const subtotal = FIRST_SCOOP_PRICE + additionalScoopsTotal
  const shipping = calculateScoopShipping(numberOfScoops)

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    additionalScoopsTotal,
  }
}

export const scoopPricing = {
  firstScoop: FIRST_SCOOP_PRICE,
  additionalScoop: ADDITIONAL_SCOOP_PRICE,
}

interface ScoopPrice {
  subtotal: number
  shipping: number
  total: number
  additionalScoopsTotal: number
}