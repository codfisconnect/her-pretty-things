import { getDatabase } from '../config/database.js'

export async function getScoopConfig() {
  const db = getDatabase()

  const setting = await db.scoopSetting.findFirst({
    where: {
      active: true,
    },
    include: {
      shippingRules: {
        where: {
          active: true,
        },
        orderBy: {
          scoopCount: 'asc',
        },
      },
    },
  })

  if (!setting) {
    throw new Error('Scoop configuration is not available.')
  }

  const [colours, characters, items] = await Promise.all([
    db.scoopColour.findMany({
      where: {
        active: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),

    db.scoopCharacter.findMany({
      where: {
        active: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),

    db.scoopItem.findMany({
      where: {
        active: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),
  ])

  return {
    pricing: {
      firstScoop: setting.firstScoopPrice,
      additionalScoop: setting.additionalScoopPrice,
    },

    limits: {
      maxScoops: setting.maxScoops,
      maxPreferredItems: setting.maxPreferredItems,
      maxExcludedItems: setting.maxExcludedItems,
    },

    shippingRules: setting.shippingRules.map((rule) => ({
      scoopCount: rule.scoopCount,
      shipping: rule.shipping,
    })),

    colours: colours.map((colour) => ({
  id: colour.id,
  name: colour.name,
})),
characters: characters.map((character) => ({
  id: character.id,
  name: character.name,
})),
items: items.map((item) => ({
  id: item.id,
  name: item.name,
})),
  }
}