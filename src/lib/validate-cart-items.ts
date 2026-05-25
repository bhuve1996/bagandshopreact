import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { requireDatabaseForCheckout } from "@/lib/security/env";
import type { CartItem } from "@/types";

const MAX_LINE_QTY = 99;

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

type CartLineInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export async function validateAndResolveCartItems(
  lines: CartLineInput[]
): Promise<CartItem[]> {
  if (!lines.length) {
    throw new OrderValidationError("Cart is empty");
  }

  if (requireDatabaseForCheckout() && !(await isDatabaseReady())) {
    throw new OrderValidationError("Checkout is temporarily unavailable");
  }

  if (!(await isDatabaseReady())) {
    throw new OrderValidationError("Database required for checkout");
  }

  const prisma = getPrisma();
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const resolved: CartItem[] = [];

  for (const line of lines) {
    if (line.quantity < 1 || line.quantity > MAX_LINE_QTY) {
      throw new OrderValidationError("Invalid quantity");
    }

    const product = byId.get(line.productId);
    if (!product) {
      throw new OrderValidationError("Product not found");
    }

    let price = product.price;
    let stock = product.stock;
    const image = product.images[0] ?? "/placeholder-product.svg";

    if (line.variantId) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        throw new OrderValidationError(`Variant not found for ${product.name}`);
      }
      price = variant.price;
      stock = variant.stock;
    }

    if (stock < line.quantity) {
      throw new OrderValidationError(`${product.name} is out of stock`);
    }

    resolved.push({
      productId: product.id,
      variantId: line.variantId,
      name: product.name,
      image,
      price,
      quantity: line.quantity,
      slug: product.slug,
    });
  }

  return resolved;
}

export async function decrementStockForItems(items: CartItem[]) {
  const prisma = getPrisma();
  for (const item of items) {
    if (item.variantId) {
      const updated = await prisma.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new OrderValidationError(`${item.name} is out of stock`);
      }
    } else {
      const updated = await prisma.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new OrderValidationError(`${item.name} is out of stock`);
      }
    }
  }
}
