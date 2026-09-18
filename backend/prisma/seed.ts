/// <reference types="node" />
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const colours = [
    'Pink',
    'Pastel',
    'Purple',
    'Blue',
    'Yellow',
    'Green',
    'Mixed / Surprise',
]

const characters = [
    'Cute Bear',
    'Bunny',
    'Kitty',
    'Kuromi-inspired',
    'Sanrio-style',
    'Cinnamoroll-inspired',
    'Disney-inspired',
    'Other',
]

const items = [
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
]

function calculateShipping(scoopCount: number) {
    if (scoopCount < 1) {
        return 0
    }

    if (scoopCount === 1) {
        return 149
    }

    let shipping = 149

    for (let scoop = 2; scoop <= scoopCount; scoop++) {
        const increase = Math.max(120 - scoop * 10, 30)
        shipping += increase
    }

    return shipping
}

async function main() {
    const setting = await prisma.scoopSetting.upsert({
        where: {
            id: 'default-scoop-setting',
        },
        update: {
            firstScoopPrice: 1499,
            additionalScoopPrice: 1299,
            maxScoops: 10,
            maxPreferredItems: 2,
            maxExcludedItems: 2,
            active: true,
        },
        create: {
            id: 'default-scoop-setting',
            firstScoopPrice: 1499,
            additionalScoopPrice: 1299,
            maxScoops: 10,
            maxPreferredItems: 2,
            maxExcludedItems: 2,
            active: true,
        },
    })

    for (let scoopCount = 1; scoopCount <= 10; scoopCount++) {
        await prisma.scoopShippingRule.upsert({
            where: {
                scoopCount,
            },
            update: {
                shipping: calculateShipping(scoopCount),
                settingId: setting.id,
                active: true,
            },
            create: {
                scoopCount,
                shipping: calculateShipping(scoopCount),
                settingId: setting.id,
                active: true,
            },
        })
    }

    for (const [index, name] of colours.entries()) {
        await prisma.scoopColour.upsert({
            where: { name },
            update: {
                active: true,
                sortOrder: index,
            },
            create: {
                name,
                active: true,
                sortOrder: index,
            },
        })
    }

    for (const [index, name] of characters.entries()) {
        await prisma.scoopCharacter.upsert({
            where: { name },
            update: {
                active: true,
                sortOrder: index,
            },
            create: {
                name,
                active: true,
                sortOrder: index,
            },
        })
    }

    for (const [index, name] of items.entries()) {
        await prisma.scoopItem.upsert({
            where: { name },
            update: {
                active: true,
                sortOrder: index,
            },
            create: {
                name,
                active: true,
                sortOrder: index,
            },
        })
    }

    console.log('Scoop configuration seeded successfully.')
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })