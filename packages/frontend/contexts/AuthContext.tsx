'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Simple JWT decode function for client-side use
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

// Server authentication endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ppwyq3yin2.execute-api.ap-northeast-2.amazonaws.com/dev'

async function authenticateWithServer(googleCredential: string): Promise<{ token: string, user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credential: googleCredential
    })
  })
  
  if (!response.ok) {
    throw new Error('Authentication failed')
  }
  
  return await response.json()
}

interface User {
  id: string
  email: string
  name: string
  image?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (response: any) => Promise<void>
  signOut: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google: any
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getToken = () => {
    return localStorage.getItem('auth-token')
  }

  const signIn = async (response: any): Promise<void> => {
    try {
      // Handle Google Sign-In response from HTML elements
      if (response && response.credential) {
        // Send Google credential to server for verification and JWT creation
        const authResult = await authenticateWithServer(response.credential)
        
        setUser(authResult.user)
        localStorage.setItem('auth-token', authResult.token)
        localStorage.setItem('user', JSON.stringify(authResult.user))
      } else {
        throw new Error('No credential received from Google')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  useEffect(() => {
    // Load stored user data on mount
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('auth-token')
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        // Verify token is still valid
        const decoded = decodeJWT(storedToken)
        if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser(userData)
        } else {
          // Token expired, clear storage
          localStorage.removeItem('auth-token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error loading stored user:', error)
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    getToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}