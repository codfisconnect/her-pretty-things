import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  addCartItem,
  getCart,
  getOrCreateCart,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCartApi,
  type CartResponse,
  type AddCartItemRequest,
} from '../services/cartService'
import type { ScoopConfiguration } from '../pages/Scoops/scoopTypes'

interface CartContextType {
  cart: CartResponse | null
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  loading: boolean
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  addToCart: (request: AddCartItemRequest) => Promise<void>
  updateQuantity: (itemId: string, quantity: number, scoopConfig?: ScoopConfiguration) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  isItemInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

const CART_ID_KEY = 'hpt_cart_id'
const SESSION_ID_KEY = 'hpt_session_id'
const CART_CACHE_KEY = 'hpt_cart_cache'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartResponse | null>(() => {
    // Hydrate immediately from cache to prevent flashing 0
    const cached = localStorage.getItem(CART_CACHE_KEY)
    if (cached) {
      try {
        return JSON.parse(cached) as CartResponse
      } catch {
        return null
      }
    }
    return null
  })

  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), [])

  const persistCart = useCallback((newCart: CartResponse | null) => {
    setCart(newCart)
    if (newCart) {
      localStorage.setItem(CART_ID_KEY, newCart.id)
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify(newCart))
    } else {
      localStorage.removeItem(CART_ID_KEY)
      localStorage.removeItem(CART_CACHE_KEY)
    }
  }, [])

  const getSessionId = useCallback(() => {
    let sid = localStorage.getItem(SESSION_ID_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      localStorage.setItem(SESSION_ID_KEY, sid)
    }
    return sid
  }, [])

  const refreshCart = useCallback(async () => {
    const savedCartId = localStorage.getItem(CART_ID_KEY)
    const sessionId = getSessionId()

    try {
      if (savedCartId) {
        const fetched = await getCart(savedCartId)
        persistCart(fetched)
      } else {
        const fetched = await getOrCreateCart(undefined, sessionId)
        persistCart(fetched)
      }
    } catch {
      // Retain cached state if network fails
    } finally {
      setLoading(false)
    }
  }, [getSessionId, persistCart])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (request: AddCartItemRequest) => {
    const savedCartId = localStorage.getItem(CART_ID_KEY) || cart?.id
    const sessionId = getSessionId()

    // 1. Optimistic itemCount update if we know quantity
    const addQty = request.quantity || 1
    if (cart) {
      setCart((prev) => prev ? { ...prev, itemCount: prev.itemCount + addQty } : null)
    }

    try {
      const updated = await addCartItem({
        ...request,
        cartId: savedCartId || undefined,
        sessionId,
      })
      persistCart(updated)
      // Open drawer preview on add
      setIsDrawerOpen(true)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      await refreshCart()
      throw error
    }
  }, [cart, getSessionId, persistCart, refreshCart])

  const updateQuantity = useCallback(async (itemId: string, quantity: number, scoopConfig?: ScoopConfiguration) => {
    if (!cart) return

    // Optimistic UI update
    const previousCart = { ...cart }
    const updatedItems = cart.items.map((item) => {
      if (item.id === itemId) {
        const newSubtotal = item.unitPrice * quantity
        return {
          ...item,
          quantity,
          subtotal: newSubtotal,
          total: newSubtotal + item.shipping,
        }
      }
      return item
    })

    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const newTotal = newSubtotal + cart.shipping
    const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

    setCart({
      ...cart,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newTotal,
      itemCount: newItemCount,
    })

    try {
      const serverCart = await updateCartItemApi(itemId, quantity, scoopConfig)
      persistCart(serverCart)
    } catch (error) {
      console.error('Failed to update cart item quantity:', error)
      persistCart(previousCart) // Rollback on error
    }
  }, [cart, persistCart])

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!cart) return

    const previousCart = { ...cart }
    const updatedItems = cart.items.filter((item) => item.id !== itemId)
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const newTotal = newSubtotal + cart.shipping
    const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

    setCart({
      ...cart,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newTotal,
      itemCount: newItemCount,
    })

    try {
      const serverCart = await removeCartItemApi(itemId)
      persistCart(serverCart)
    } catch (error) {
      console.error('Failed to remove cart item:', error)
      persistCart(previousCart)
    }
  }, [cart, persistCart])

  const clearCart = useCallback(async () => {
    const savedCartId = localStorage.getItem(CART_ID_KEY)
    if (savedCartId) {
      try {
        const empty = await clearCartApi(savedCartId)
        persistCart(empty)
      } catch {
        // Fallback
        if (cart) {
          persistCart({
            ...cart,
            items: [],
            itemCount: 0,
            subtotal: 0,
            shipping: 0,
            total: 0,
          })
        }
      }
    }
  }, [cart, persistCart])

  const isItemInCart = useCallback((productId: string) => {
    if (!cart) return false
    return cart.items.some((item) => item.productId === productId && !item.isCustomizedScoop && !item.isByob)
  }, [cart])

  const itemCount = useMemo(() => {
    if (!cart) return 0
    return cart.itemCount ?? cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const subtotal = cart?.subtotal ?? 0
  const shipping = cart?.shipping ?? 0
  const total = cart?.total ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        shipping,
        total,
        loading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        isItemInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
