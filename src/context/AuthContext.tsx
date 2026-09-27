import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getStoredUser,
  saveStoredUser,
  loginCustomerApi,
  registerCustomerApi,
  getCustomerProfileApi,
  updateCustomerProfileApi,
  type CustomerUser,
} from '../services/authService'
import { syncMergeWishlist, getLocalWishlist } from '../services/wishlistService'

interface AuthContextType {
  user: CustomerUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<CustomerUser>
  register: (data: { email: string; password: string; name?: string; phone?: string }) => Promise<CustomerUser>
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string }) => Promise<CustomerUser>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  const refreshUser = useCallback(async () => {
    const current = getStoredUser()
    if (!current?.id) return
    setLoading(true)
    try {
      const refreshed = await getCustomerProfileApi(current.id)
      setUser(refreshed)
      saveStoredUser(refreshed)
    } catch {
      // Retain stored user if offline
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginCustomerApi({ email, password })
    setUser(loggedIn)
    saveStoredUser(loggedIn)

    // Merge guest wishlist into user account
    const guestItems = getLocalWishlist()
    if (guestItems.length > 0) {
      syncMergeWishlist(loggedIn.id, guestItems.map((p) => p.id)).catch(() => undefined)
    }

    return loggedIn
  }, [])

  const register = useCallback(async (data: { email: string; password: string; name?: string; phone?: string }) => {
    const created = await registerCustomerApi(data)
    setUser(created)
    saveStoredUser(created)

    // Merge guest wishlist
    const guestItems = getLocalWishlist()
    if (guestItems.length > 0) {
      syncMergeWishlist(created.id, guestItems.map((p) => p.id)).catch(() => undefined)
    }

    return created
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveStoredUser(null)
  }, [])

  const updateProfile = useCallback(async (data: { name?: string; phone?: string }) => {
    if (!user) throw new Error('Not logged in')
    const updated = await updateCustomerProfileApi(user.id, data)
    setUser(updated)
    saveStoredUser(updated)
    return updated
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
