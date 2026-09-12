import type { CartItem, Prisma } from "@prisma/client";
import { getDatabase } from "../config/database.js";
import { HttpError } from "../middleware/errorHandler.js";
import { calculateScoopPrice } from "../utils/pricing.js";

const cartInclude = {
  items: { include: { product: { include: { images: true } } } },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export interface ScoopConfigurationInput {
  numberOfScoops: number;
  colourTheme?: string;
  preferredCharacter?: string;
  preferredItems?: string[];
  excludedItems?: string[];
  additionalMessage?: string;
}

export interface AddCartItemInput {
  cartId?: string;
  sessionId?: string;
  productId?: string;
  quantity?: number;
  scoopConfiguration?: ScoopConfigurationInput;
}

export interface UpdateCartItemInput {
  quantity?: number;
  scoopConfiguration?: ScoopConfigurationInput;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringArray(value: unknown, fieldName: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string"))
    throw new HttpError(400, `${fieldName} must be an array of strings.`);
  return value;
}

export function readAddCartItemInput(value: unknown): AddCartItemInput {
  if (!isRecord(value))
    throw new HttpError(400, "Cart item payload must be an object.");
  const scoopConfiguration = value.scoopConfiguration;
  return {
    cartId: typeof value.cartId === "string" ? value.cartId : undefined,
    sessionId:
      typeof value.sessionId === "string" ? value.sessionId : undefined,
    productId:
      typeof value.productId === "string" ? value.productId : undefined,
    quantity:
      value.quantity === undefined ? undefined : (value.quantity as number),
    scoopConfiguration:
      scoopConfiguration === undefined
        ? undefined
        : readScoopConfiguration(scoopConfiguration),
  };
}

export function readUpdateCartItemInput(value: unknown): UpdateCartItemInput {
  if (!isRecord(value))
    throw new HttpError(400, "Cart item update payload must be an object.");
  return {
    quantity:
      value.quantity === undefined ? undefined : (value.quantity as number),
    scoopConfiguration:
      value.scoopConfiguration === undefined
        ? undefined
        : readScoopConfiguration(value.scoopConfiguration),
  };
}

function readScoopConfiguration(value: unknown): ScoopConfigurationInput {
  if (!isRecord(value))
    throw new HttpError(400, "scoopConfiguration must be an object.");
  const numberOfScoops = value.numberOfScoops;
  if (
    typeof numberOfScoops !== "number" ||
    !Number.isInteger(numberOfScoops) ||
    numberOfScoops < 1 ||
    numberOfScoops > 10
  ) {
    throw new HttpError(
      400,
      "numberOfScoops must be an integer between 1 and 10.",
    );
  }
  const preferredItems = readStringArray(
    value.preferredItems,
    "preferredItems",
  );
  const excludedItems = readStringArray(value.excludedItems, "excludedItems");
  if (preferredItems.length > 3)
    throw new HttpError(
      400,
      "preferredItems cannot contain more than 3 items.",
    );
  if (excludedItems.length > 3)
    throw new HttpError(400, "excludedItems cannot contain more than 3 items.");
  if (
    new Set(preferredItems).size !== preferredItems.length ||
    new Set(excludedItems).size !== excludedItems.length
  )
    throw new HttpError(
      400,
      "Scoop item preferences cannot contain duplicates.",
    );
  if (preferredItems.some((item) => excludedItems.includes(item)))
    throw new HttpError(
      400,
      "preferredItems and excludedItems cannot overlap.",
    );
  if (
    value.additionalMessage !== undefined &&
    (typeof value.additionalMessage !== "string" ||
      value.additionalMessage.length > 300)
  )
    throw new HttpError(
      400,
      "additionalMessage must be 300 characters or fewer.",
    );

  return {
    numberOfScoops,
    colourTheme:
      typeof value.colourTheme === "string" ? value.colourTheme : undefined,
    preferredCharacter:
      typeof value.preferredCharacter === "string"
        ? value.preferredCharacter
        : undefined,
    preferredItems,
    excludedItems,
    additionalMessage:
      typeof value.additionalMessage === "string"
        ? value.additionalMessage
        : undefined,
  };
}

function validateQuantity(quantity: number | undefined): number {
  if (quantity === undefined) return 1;
  if (!Number.isInteger(quantity) || quantity < 1)
    throw new HttpError(400, "quantity must be a positive integer.");
  return quantity;
}

function calculateCartShipping(items: CartWithItems['items']) {
  const totalScoops = items.reduce((sum, item) => {
    if (!item.isCustomizedScoop) return sum

    return sum + (item.numberOfScoops ?? 0) * item.quantity
  }, 0)

  if (totalScoops === 0) return 0
  if (totalScoops === 1) return 149
  if (totalScoops === 2) return 249
  if (totalScoops === 3) return 339
  if (totalScoops === 4) return 419
  if (totalScoops === 5) return 489
  if (totalScoops === 6) return 549
  if (totalScoops === 7) return 599
  if (totalScoops === 8) return 639

  return 669 + (totalScoops - 9) * 30
}

function cartTotals(items: CartWithItems['items']) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shipping = calculateCartShipping(items)

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  }
}

function serializeCart(cart: CartWithItems) {
  const totals = cartTotals(cart.items);
  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    items: cart.items,
    ...totals,
  };
}

export async function getCart(cartId: string) {
  const database = getDatabase();
  const cart = await database.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });
  if (!cart) throw new HttpError(404, "Cart not found.");
  return serializeCart(cart);
}

export async function addCartItem(input: AddCartItemInput) {
  const database = getDatabase();
  if (
    (input.productId && input.scoopConfiguration) ||
    (!input.productId && !input.scoopConfiguration)
  )
    throw new HttpError(400, "Provide either productId or scoopConfiguration.");
  const cart = input.cartId
    ? await database.cart.findUnique({ where: { id: input.cartId } })
    : await database.cart.create({ data: { sessionId: input.sessionId } });
  if (!cart) throw new HttpError(404, "Cart not found.");
  const quantity = validateQuantity(input.quantity);

  let data: Prisma.CartItemUncheckedCreateInput;
  if (input.scoopConfiguration) {
    const price = calculateScoopPrice(input.scoopConfiguration.numberOfScoops);
    data = {
      cartId: cart.id,
      quantity,
      unitPrice: price.subtotal,
      subtotal: price.subtotal * quantity,
      shipping: price.shipping,
      total: price.subtotal * quantity,
      isCustomizedScoop: true,
      numberOfScoops: input.scoopConfiguration.numberOfScoops,
      colourTheme: input.scoopConfiguration.colourTheme,
      preferredCharacter: input.scoopConfiguration.preferredCharacter,
      preferredItems: input.scoopConfiguration.preferredItems ?? [],
      excludedItems: input.scoopConfiguration.excludedItems ?? [],
      additionalMessage: input.scoopConfiguration.additionalMessage,
    };
  } else {
    const product = await database.product.findUnique({
      where: { slug: input.productId },
    });
    if (!product) throw new HttpError(404, "Product not found.");
    data = {
      cartId: cart.id,
      productId: product.id,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
      shipping: 0,
      total: product.price * quantity,
      isCustomizedScoop: false,
      preferredItems: [],
      excludedItems: [],
    };
  }

  if (!input.scoopConfiguration && input.productId) {
    const existingItem = await database.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        isCustomizedScoop: false,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      await database.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          subtotal: existingItem.unitPrice * newQuantity,
          total: existingItem.unitPrice * newQuantity,
        },
      });

      return getCart(cart.id);
    }
  }

  if (input.scoopConfiguration) {
    const existingScoop = await database.cartItem.findFirst({
      where: {
        cartId: cart.id,
        isCustomizedScoop: true,
        numberOfScoops: input.scoopConfiguration.numberOfScoops,
        colourTheme: input.scoopConfiguration.colourTheme ?? null,
        preferredCharacter: input.scoopConfiguration.preferredCharacter ?? null,
        preferredItems: {
          equals: input.scoopConfiguration.preferredItems ?? [],
        },
        excludedItems: {
          equals: input.scoopConfiguration.excludedItems ?? [],
        },
        additionalMessage: input.scoopConfiguration.additionalMessage ?? null,
      },
    });

    if (existingScoop) {
      const newQuantity = existingScoop.quantity + quantity;

      await database.cartItem.update({
        where: { id: existingScoop.id },
        data: {
          quantity: newQuantity,
          subtotal: existingScoop.unitPrice * newQuantity,
          total: existingScoop.unitPrice * newQuantity,
        },
      });

      return getCart(cart.id);
    }
  }

  if (input.scoopConfiguration) {
    const existingScoop = await database.cartItem.findFirst({
      where: {
        cartId: cart.id,
        isCustomizedScoop: true,
        numberOfScoops: input.scoopConfiguration.numberOfScoops,
        colourTheme: input.scoopConfiguration.colourTheme ?? null,
        preferredCharacter: input.scoopConfiguration.preferredCharacter ?? null,
        additionalMessage: input.scoopConfiguration.additionalMessage ?? null,
      },
    });

    if (existingScoop) {
      const newQuantity = existingScoop.quantity + quantity;

      await database.cartItem.update({
        where: { id: existingScoop.id },
        data: {
          quantity: newQuantity,
          subtotal: existingScoop.unitPrice * newQuantity,
          total: existingScoop.unitPrice * newQuantity,
        },
      });

      return getCart(cart.id);
    }
  }

  if (!input.scoopConfiguration && input.productId) {
    const existingItem = await database.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        isCustomizedScoop: false,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      await database.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          subtotal: existingItem.unitPrice * newQuantity,
          total: existingItem.unitPrice * newQuantity,
        },
      });

      return getCart(cart.id);
    }
  }

  await database.cartItem.create({ data });
  return getCart(cart.id);
}

export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput,
) {
  const database = getDatabase();
  const item = await database.cartItem.findUnique({ where: { id: itemId } });
  if (!item) throw new HttpError(404, "Cart item not found.");
  const quantity = validateQuantity(input.quantity ?? item.quantity);
  const data: Prisma.CartItemUpdateInput = { quantity };

  if (item.isCustomizedScoop) {
    const currentConfiguration: ScoopConfigurationInput = {
      numberOfScoops: item.numberOfScoops ?? 0,
      colourTheme: item.colourTheme ?? undefined,
      preferredCharacter: item.preferredCharacter ?? undefined,
      preferredItems: item.preferredItems,
      excludedItems: item.excludedItems,
      additionalMessage: item.additionalMessage ?? undefined,
    };
    const configuration = input.scoopConfiguration ?? currentConfiguration;
    const price = calculateScoopPrice(configuration.numberOfScoops);
    data.unitPrice = price.subtotal;
    data.subtotal = price.subtotal * quantity;
    data.shipping = price.shipping;
    data.total = price.subtotal * quantity;
    data.numberOfScoops = configuration.numberOfScoops;
    data.colourTheme = configuration.colourTheme;
    data.preferredCharacter = configuration.preferredCharacter;
    data.preferredItems = configuration.preferredItems ?? [];
    data.excludedItems = configuration.excludedItems ?? [];
    data.additionalMessage = configuration.additionalMessage;
  } else if (input.scoopConfiguration) {
    throw new HttpError(
      400,
      "Only customized scoop items support scoopConfiguration updates.",
    );
  } else {
    data.subtotal = item.unitPrice * quantity;
    data.total = item.unitPrice * quantity;
  }

  await database.cartItem.update({ where: { id: itemId }, data });
  return getCart(item.cartId);
}

export async function removeCartItem(itemId: string) {
  const database = getDatabase();
  const item = await database.cartItem.findUnique({ where: { id: itemId } });
  if (!item) throw new HttpError(404, "Cart item not found.");
  await database.cartItem.delete({ where: { id: itemId } });
  return getCart(item.cartId);
}

export function getCartItemTotal(item: CartItem) {
  return item.subtotal;
}
