import type { Prisma } from "@prisma/client";
import { getDatabase } from "../config/database.js";
import { HttpError } from "../middleware/errorHandler.js";
import { calculateScoopPrice } from "../utils/pricing.js";
import type { ScoopConfigurationInput } from "./cartService.js";
import { refundPayment } from "./paymentService.js";
import { getScoopConfig } from "./scoopService.js";

export interface ShippingInput {
  fullName: string;
  phoneNumber: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new HttpError(400, `${fieldName} is required.`);
  return value.trim();
}

export interface CreateOrderInput {
  cartId: string;
  shipping: ShippingInput;
  userId?: string;
}

export function readCreateOrderInput(value: unknown): CreateOrderInput {
  if (!isRecord(value))
    throw new HttpError(400, "Order payload must be an object.");
  if (!isRecord(value.shipping))
    throw new HttpError(400, "shipping is required.");
  const shipping = value.shipping;
  return {
    cartId: requiredString(value.cartId, "cartId"),
    userId: typeof value.userId === "string" ? value.userId : undefined,
    shipping: {
      fullName: requiredString(shipping.fullName, "fullName"),
      phoneNumber: requiredString(shipping.phoneNumber, "phoneNumber"),
      email: requiredString(shipping.email, "email"),
      addressLine1: requiredString(shipping.addressLine1, "addressLine1"),
      addressLine2:
        typeof shipping.addressLine2 === "string"
          ? shipping.addressLine2.trim()
          : undefined,
      city: requiredString(shipping.city, "city"),
      state: requiredString(shipping.state, "state"),
      pincode: requiredString(shipping.pincode, "pincode"),
    },
  };
}

async function recalculateCart(
  items: Array<{
    quantity: number;
    subtotal: number;
    isCustomizedScoop: boolean;
    numberOfScoops: number | null;
  }>,
) {
  let subtotal = 0;
  let totalScoops = 0;

  for (const item of items) {
    if (item.isCustomizedScoop) {
      if (item.numberOfScoops === null) {
        throw new HttpError(
          400,
          "Customized scoop configuration is incomplete.",
        );
      }

      const price = calculateScoopPrice(item.numberOfScoops);

      subtotal += price.subtotal * item.quantity;
      totalScoops += item.numberOfScoops * item.quantity;
    } else {
      subtotal += item.subtotal;
    }
  }

  let shippingAmount = 0;

  if (totalScoops > 0) {
    // Keep the existing Scoop shipping rules unchanged.
    const scoopConfig = await getScoopConfig();

    shippingAmount =
      scoopConfig.shippingRules.find((rule) => rule.scoopCount === totalScoops)
        ?.shipping ?? 0;
  } else {
    // Jewellery + Kawaii only:
    // ₹500 or above = free shipping
    // Below ₹500 = ₹100 shipping
    shippingAmount = subtotal >= 500 ? 0 : 100;
  }

  return {
    subtotal,
    shippingAmount,
    totalAmount: subtotal + shippingAmount,
  };
}

async function generateOrderNumber(
  transaction: Prisma.TransactionClient,
): Promise<string> {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const prefix = `HPT-${year}${month}${day}-`;

  // Lock order-number generation for this day's prefix.
  // This prevents two simultaneous orders from receiving
  // the same sequence number.
  await transaction.$executeRaw`
    SELECT pg_advisory_xact_lock(
      hashtextextended(${prefix}, 0)
    )
  `;

  const lastOrder = await transaction.order.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      orderNumber: "desc",
    },
    select: {
      orderNumber: true,
    },
  });

  let sequence = 1;

  if (lastOrder?.orderNumber) {
    const lastSequence = Number(lastOrder.orderNumber.slice(-3));

    if (!Number.isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(3, "0")}`;
}

export async function createOrder(input: CreateOrderInput) {
  const database = getDatabase();
  const cart = await database.cart.findUnique({
    where: {
      id: input.cartId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty or does not exist.");
  }

  for (const item of cart.items) {
    if (item.isCustomizedScoop) {
      continue;
    }

    if (!item.product) {
      throw new HttpError(400, "Product not found.");
    }

    if (!item.product.active) {
      throw new HttpError(409, `${item.product.name} is no longer available.`);
    }

    if (item.product.stock < item.quantity) {
      throw new HttpError(
        409,
        `${item.product.name} has only ${item.product.stock} item(s) available.`,
      );
    }
  }

  const totals = await recalculateCart(cart.items);

  return database.$transaction(async (transaction) => {
    // Validate and reserve stock for normal products.
    // Customized Scoops do not use Product stock.
    for (const item of cart.items) {
      if (item.isCustomizedScoop) {
        continue;
      }

      if (!item.productId || !item.product) {
        throw new HttpError(400, "Product is missing for a cart item.");
      }

      if (!item.product.active) {
        throw new HttpError(
          409,
          `${item.product.name} is no longer available.`,
        );
      }

      const updatedStock = await transaction.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (updatedStock.count !== 1) {
        throw new HttpError(
          409,
          `Insufficient stock for ${item.product.name}.`,
        );
      }
    }

    const address = await transaction.address.create({
      data: {
        ...input.shipping,
        userId: input.userId,
      },
    });

    const orderNumber = await generateOrderNumber(transaction);

const order = await transaction.order.create({
  data: {
    orderNumber,
    userId: input.userId,
    cartId: cart.id,
    addressId: address.id,
    ...totals,
        items: {
          create: cart.items.map(
            (item): Prisma.OrderItemUncheckedCreateWithoutOrderInput => ({
              productId: item.productId,
              productName: item.product?.name ?? "Customized Pretty Scoop",
              quantity: item.quantity,
              unitPrice: item.isCustomizedScoop
                ? calculateScoopPrice(item.numberOfScoops ?? 0).subtotal
                : item.unitPrice,
              totalPrice: item.isCustomizedScoop
                ? calculateScoopPrice(item.numberOfScoops ?? 0).subtotal *
                  item.quantity
                : item.subtotal,
              isCustomizedScoop: item.isCustomizedScoop,
              numberOfScoops: item.numberOfScoops,
              colourTheme: item.colourTheme,
              preferredCharacter: item.preferredCharacter,
              preferredItems: item.preferredItems,
              excludedItems: item.excludedItems,
              additionalMessage: item.additionalMessage,
              age: item.age,
            }),
          ),
        },
      },
      include: {
        address: true,
        items: true,
      },
    });

    return order;
  });
}

export async function getOrder(orderId: string) {
  const database = getDatabase();
  const order = await database.order.findUnique({
    where: { id: orderId },
    include: { address: true, items: true },
  });
  if (!order) throw new HttpError(404, "Order not found.");
  return order;
}

export async function cancelOrder(orderId: string) {
  const database = getDatabase();

  const order = await database.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new HttpError(404, "Order not found.");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new HttpError(409, "Order is already cancelled.");
  }

  if (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") {
    throw new HttpError(
      409,
      "Shipped or delivered orders cannot be cancelled.",
    );
  }

  // Refund paid orders before completing cancellation.
  if (order.paymentStatus === "PAID") {
    await refundPayment(order.id);
  }

  return database.$transaction(async (transaction) => {
    for (const item of order.items) {
      if (item.isCustomizedScoop) {
        continue;
      }

      if (!item.productId) {
        throw new HttpError(
          400,
          `Product information is missing for order item ${item.id}.`,
        );
      }

      await transaction.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    const cancelledOrder = await transaction.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: "CANCELLED",
      },
      include: {
        address: true,
        items: true,
      },
    });

    return cancelledOrder;
  });
}
