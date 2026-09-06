export const scoopColours = [
  'No Preference',
  'Pink',
  'Pastel',
  'Purple',
  'Blue',
  'Yellow',
  'Green',
  'Mixed / Surprise',
] as const

export const scoopCharacters = [
  'No Preference',
  'Cute Bear',
  'Bunny',
  'Kitty',
  'Kuromi-inspired',
  'Sanrio-style',
  'Cinnamoroll-inspired',
  'Disney-inspired',
  'Other',
] as const

export const scoopItems = [
  'Stationery Set',
  'Mini Notebook',
  'Hair Accessories',
  'Multi-use Pouch',
  'Highlighter',
  'Comb Brush',
  'Multicolor Pen',
  'Sticky Note',
  'Jewellery',
  'Water Bottle',
  'Eraser',
  'Squishy',
  'Cute Pen',
  'Beauty Care',
  'Character Keychain',
  'Pocket Mirror',
  'Bracelet',
  'Plush Toy',
  'Diary',
  'Fancy Keychain',
  'Coin Pouch',
  'Daily Care',
  'Jewellery Box',
  'Sticker',
  'Claw Clip',
  'Scrunchie',
  'Charms',
  'Surprise Gift',
] as const

export type ScoopColour = (typeof scoopColours)[number]
export type ScoopCharacter = (typeof scoopCharacters)[number]
export type ScoopItem = (typeof scoopItems)[number]

export interface ScoopPrice {
  subtotal: number
  shipping: number
  total: number
  additionalScoopsTotal: number
}

export interface ScoopConfiguration {
  numberOfScoops: number
  colourTheme: ScoopColour | ''
  preferredCharacter: ScoopCharacter | ''
  preferredItems: ScoopItem[]
  excludedItems: ScoopItem[]
  additionalMessage: string
  subtotal: number
  shipping: number
  total: number
}
