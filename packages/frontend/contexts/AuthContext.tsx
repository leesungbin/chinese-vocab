'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { API_BASE_URL } from '@/config/api'

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

async function authenticateWithServer(
  credential: string,
  isOAuth: boolean = false
): Promise<{ token: string; user?: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        credential: credential,
        isOAuth: isOAuth,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Authentication failed: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Authentication error:', error)
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error(
        'Unable to connect to authentication server. Please check your internet connection.'
      )
    }
    throw error
  }
}

interface User {
  id: string
  email: string
  name: string
  image?: string
}

interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (response: any) => Promise<void>
  signOut: () => void
  getToken: () => string | null
  getOAuthToken: () => string | null
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
  const [oauthTokens, setOAuthTokens] = useState<OAuthTokens | null>(null)

  const getToken = () => {
    return localStorage.getItem('auth-token')
  }

  const getOAuthToken = () => {
    return localStorage.getItem('oauth-token')
  }

  const fetchUserProfile = async (accessToken: string): Promise<User> => {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    const profile = await response.json()
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      image: profile.picture,
    }
  }

  const signIn = async (response: any): Promise<void> => {
    try {
      // Handle OAuth 2.0 response
      if (response && response.access_token) {
        // Store OAuth tokens
        const tokens: OAuthTokens = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_in: response.expires_in,
          scope: response.scope,
          token_type: response.token_type || 'Bearer',
        }

        setOAuthTokens(tokens)
        localStorage.setItem('oauth-token', response.access_token)
        localStorage.setItem('oauth-tokens', JSON.stringify(tokens))

        // Fetch user profile using OAuth token
        const userProfile = await fetchUserProfile(response.access_token)

        // Send OAuth access token to server for JWT creation
        const authResult = await authenticateWithServer(
          response.access_token,
          true
        )

        setUser(userProfile)
        localStorage.setItem('auth-token', authResult.token)
        localStorage.setItem('user', JSON.stringify(userProfile))
      } else if (response && response.credential) {
        // Fallback for old ID token flow (if still needed)
        const authResult = await authenticateWithServer(response.credential)

        setUser(authResult.user)
        localStorage.setItem('auth-token', authResult.token)
        localStorage.setItem('user', JSON.stringify(authResult.user))
      } else {
        throw new Error('No valid authentication response received')
      }
    } catch (error) {
      console.error('Sign in error:', error)

      // Clear any partial auth state on error
      setUser(null)
      setOAuthTokens(null)
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
      localStorage.removeItem('oauth-token')
      localStorage.removeItem('oauth-tokens')

      // Re-throw to allow UI components to handle the error
      throw error
    }
  }

  const signOut = () => {
    setUser(null)
    setOAuthTokens(null)
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    localStorage.removeItem('oauth-token')
    localStorage.removeItem('oauth-tokens')

    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  useEffect(() => {
    // Load stored user data on mount
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('auth-token')
    const storedOAuthTokens = localStorage.getItem('oauth-tokens')

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        // Verify token is still valid
        const decoded = decodeJWT(storedToken)
        if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser(userData)

          // Load OAuth tokens if available
          if (storedOAuthTokens) {
            try {
              const tokens = JSON.parse(storedOAuthTokens)
              setOAuthTokens(tokens)
            } catch (error) {
              console.error('Error loading OAuth tokens:', error)
            }
          }
        } else {
          // Token expired, clear all storage
          localStorage.removeItem('auth-token')
          localStorage.removeItem('user')
          localStorage.removeItem('oauth-token')
          localStorage.removeItem('oauth-tokens')
        }
      } catch (error) {
        console.error('Error loading stored user:', error)
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user')
        localStorage.removeItem('oauth-token')
        localStorage.removeItem('oauth-tokens')
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
    getOAuthToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
