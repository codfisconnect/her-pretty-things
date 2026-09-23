import type { Product } from "../types/product";

const WISHLIST_KEY = "hpt_wishlist";

export function getWishlist(): Product[] {
  const savedWishlist = localStorage.getItem(WISHLIST_KEY);

  if (!savedWishlist) {
    return [];
  }

  try {
    return JSON.parse(savedWishlist) as Product[];
  } catch {
    return [];
  }
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().some((product) => product.id === productId);
}

export function toggleWishlist(product: Product): boolean {
  const wishlist = getWishlist();
  const existingIndex = wishlist.findIndex(
    (item) => item.id === product.id,
  );

  if (existingIndex >= 0) {
    wishlist.splice(existingIndex, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return false;
  }

  wishlist.push(product);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  return true;
}