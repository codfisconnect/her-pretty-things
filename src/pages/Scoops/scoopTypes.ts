export interface ScoopOption {
  id: string
  name: string
}

export type ScoopColour = ScoopOption
export type ScoopCharacter = ScoopOption
export type ScoopItem = ScoopOption

export interface ScoopPrice {
  subtotal: number
  shipping: number
  total: number
  additionalScoopsTotal: number
}

export interface ScoopConfiguration {
  numberOfScoops: number
  age: number
  colourTheme: ScoopColour | ''
  preferredCharacter: ScoopCharacter | ''
  preferredItems: string[]
  excludedItems: string[]
  additionalMessage: string
  subtotal: number
  shipping: number
  total: number
}