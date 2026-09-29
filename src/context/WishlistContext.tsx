import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { Product } from '../types/product'
import {
  getLocalWishlist,
  saveLocalWishlist,
  fetchServerWishlist,
  syncToggleWishlist,
} from '../services/wishlistService'

interface WishlistContextType {
  wishlist: Product[]
  wishlistCount: number
  loading: boolean
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => getLocalWishlist())
  const [loading, setLoading] = useState(false)

  const refreshWishlist = useCallback(async () => {
    setLoading(true)
    const sessionId = localStorage.getItem('hpt_session_id') || undefined
    const userJson = localStorage.getItem('hpt_customer_user')
    const userId = userJson ? JSON.parse(userJson).id : undefined

    try {
      const items = await fetchServerWishlist({ userId, sessionId })
      setWishlist(items)
    } catch {
      // Retain local state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((p) => p.id === productId)
  }, [wishlist])

  const toggleWishlist = useCallback((product: Product) => {
    const isAlreadyWishlisted = wishlist.some((p) => p.id === product.id)
    let updated: Product[]

    if (isAlreadyWishlisted) {
      updated = wishlist.filter((p) => p.id !== product.id)
    } else {
      updated = [product, ...wishlist]
    }

    // 1. Immediate authoritative state update
    setWishlist(updated)
    saveLocalWishlist(updated)

    // 2. Background sync
    const sessionId = localStorage.getItem('hpt_session_id') || undefined
    const userJson = localStorage.getItem('hpt_customer_user')
    const userId = userJson ? JSON.parse(userJson).id : undefined

    syncToggleWishlist({ productId: product.id, userId, sessionId }).catch((err) => {
      console.warn('Background wishlist sync failed:', err)
    })
  }, [wishlist])

  const removeFromWishlist = useCallback((productId: string) => {
    const updated = wishlist.filter((p) => p.id !== productId)
    setWishlist(updated)
    saveLocalWishlist(updated)

    const sessionId = localStorage.getItem('hpt_session_id') || undefined
    const userJson = localStorage.getItem('hpt_customer_user')
    const userId = userJson ? JSON.parse(userJson).id : undefined

    syncToggleWishlist({ productId, userId, sessionId }).catch(() => undefined)
  }, [wishlist])

  const wishlistCount = useMemo(() => wishlist.length, [wishlist])

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
