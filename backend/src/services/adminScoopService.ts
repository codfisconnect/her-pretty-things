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
      imageUrl: setting.imageUrl,
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
  imageUrl?: string
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
      ...(input.imageUrl !== undefined && {
        imageUrl: input.imageUrl,
      }),
    },
  })
}
export type ScoopOptionType =
  | 'colour'
  | 'character'
  | 'item'

export interface UpdateScoopOptionInput {
  type: ScoopOptionType
  id: string
  name?: string
  active?: boolean
  sortOrder?: number
}

export async function updateAdminScoopOption(
  input: UpdateScoopOptionInput,
) {
  const database = getDatabase()

  if (!input.id.trim()) {
    throw new HttpError(400, 'Option ID is required.')
  }

  if (
    input.name !== undefined &&
    input.name.trim().length === 0
  ) {
    throw new HttpError(400, 'Option name cannot be empty.')
  }

  if (
    input.sortOrder !== undefined &&
    (!Number.isInteger(input.sortOrder) ||
      input.sortOrder < 0)
  ) {
    throw new HttpError(
      400,
      'Sort order must be a valid non-negative number.',
    )
  }

  if (input.type === 'colour') {
    return database.scoopColour.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && {
          name: input.name.trim(),
        }),
        ...(input.active !== undefined && {
          active: input.active,
        }),
        ...(input.sortOrder !== undefined && {
          sortOrder: input.sortOrder,
        }),
      },
    })
  }

  if (input.type === 'character') {
    return database.scoopCharacter.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && {
          name: input.name.trim(),
        }),
        ...(input.active !== undefined && {
          active: input.active,
        }),
        ...(input.sortOrder !== undefined && {
          sortOrder: input.sortOrder,
        }),
      },
    })
  }

  return database.scoopItem.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined && {
        name: input.name.trim(),
      }),
      ...(input.active !== undefined && {
        active: input.active,
      }),
      ...(input.sortOrder !== undefined && {
        sortOrder: input.sortOrder,
      }),
    },
  })
}
export interface CreateScoopOptionInput {
  type: ScoopOptionType
  name: string
  sortOrder?: number
}

export async function createAdminScoopOption(
  input: CreateScoopOptionInput,
) {
  const database = getDatabase()

  const name = input.name.trim()

  if (!name) {
    throw new HttpError(400, 'Option name is required.')
  }

  const sortOrder =
    input.sortOrder !== undefined
      ? input.sortOrder
      : 0

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new HttpError(
      400,
      'Sort order must be a valid non-negative number.',
    )
  }

  if (input.type === 'colour') {
    return database.scoopColour.create({
      data: {
        name,
        active: true,
        sortOrder,
      },
    })
  }

  if (input.type === 'character') {
    return database.scoopCharacter.create({
      data: {
        name,
        active: true,
        sortOrder,
      },
    })
  }

  return database.scoopItem.create({
    data: {
      name,
      active: true,
      sortOrder,
    },
  })
}

export async function deleteAdminScoopOption(
  input: {
    type: ScoopOptionType
    id: string
  },
) {
  const database = getDatabase()

  if (!input.id.trim()) {
    throw new HttpError(400, 'Option ID is required.')
  }

  if (input.type === 'colour') {
    return database.scoopColour.delete({
      where: { id: input.id },
    })
  }

  if (input.type === 'character') {
    return database.scoopCharacter.delete({
      where: { id: input.id },
    })
  }

  return database.scoopItem.delete({
    where: { id: input.id },
  })
}