import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

export async function getAdminScoopConfig() {
  const database = getDatabase()

  const setting = await database.scoopSetting.findFirst({
    where: { active: true },
    include: {
      shippingRules: {
        orderBy: { scoopCount: 'asc' },
      },
    },
  })

  if (!setting) {
    throw new HttpError(404, 'Scoop configuration not found.')
  }

  const [colours, characters, items] = await Promise.all([
    database.scoopColour.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
    database.scoopCharacter.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
    database.scoopItem.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return {
    setting: {
      id: setting.id,
      firstScoopPrice: setting.firstScoopPrice,
      additionalScoopPrice: setting.additionalScoopPrice,
      maxScoops: setting.maxScoops,
      maxPreferredItems: setting.maxPreferredItems,
      maxExcludedItems: setting.maxExcludedItems,
      active: setting.active,
    },

    shippingRules: setting.shippingRules.map((rule) => ({
      id: rule.id,
      scoopCount: rule.scoopCount,
      shipping: rule.shipping,
      active: rule.active,
    })),

    colours: colours.map((colour) => ({
      id: colour.id,
      name: colour.name,
      active: colour.active,
      sortOrder: colour.sortOrder,
    })),

    characters: characters.map((character) => ({
      id: character.id,
      name: character.name,
      active: character.active,
      sortOrder: character.sortOrder,
    })),

    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      active: item.active,
      sortOrder: item.sortOrder,
    })),
  }
}

export interface UpdateScoopSettingInput {
  firstScoopPrice: number
  additionalScoopPrice: number
  maxScoops: number
  maxPreferredItems: number
  maxExcludedItems: number
}

export async function updateAdminScoopSetting(
  input: UpdateScoopSettingInput,
) {
  const database = getDatabase()

  if (
    !Number.isInteger(input.firstScoopPrice) ||
    input.firstScoopPrice < 0
  ) {
    throw new HttpError(400, 'First Scoop price must be a valid amount.')
  }

  if (
    !Number.isInteger(input.additionalScoopPrice) ||
    input.additionalScoopPrice < 0
  ) {
    throw new HttpError(
      400,
      'Additional Scoop price must be a valid amount.',
    )
  }

  if (
    !Number.isInteger(input.maxScoops) ||
    input.maxScoops < 1 ||
    input.maxScoops > 50
  ) {
    throw new HttpError(
      400,
      'Maximum Scoops must be between 1 and 50.',
    )
  }

  if (
    !Number.isInteger(input.maxPreferredItems) ||
    input.maxPreferredItems < 0 ||
    input.maxPreferredItems > 20
  ) {
    throw new HttpError(
      400,
      'Preferred Items limit must be between 0 and 20.',
    )
  }

  if (
    !Number.isInteger(input.maxExcludedItems) ||
    input.maxExcludedItems < 0 ||
    input.maxExcludedItems > 20
  ) {
    throw new HttpError(
      400,
      'Excluded Items limit must be between 0 and 20.',
    )
  }

  const setting = await database.scoopSetting.findFirst({
    where: { active: true },
  })

  if (!setting) {
    throw new HttpError(404, 'Scoop configuration not found.')
  }

  return database.scoopSetting.update({
    where: { id: setting.id },
    data: {
      firstScoopPrice: input.firstScoopPrice,
      additionalScoopPrice: input.additionalScoopPrice,
      maxScoops: input.maxScoops,
      maxPreferredItems: input.maxPreferredItems,
      maxExcludedItems: input.maxExcludedItems,
    },
  })
}