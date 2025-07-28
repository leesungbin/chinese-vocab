'use client'

import { useEffect, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, BookOpen, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useVocabularyData } from '@/stores/vocabularyStore'
import { useMemorizedWords } from '@/hooks/useMemorizedWords'
import { useTranslation } from '@/hooks/useTranslation'

export function AuthHeader() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth()
  const { t } = useTranslation()
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  // Get vocabulary data and memorized words for statistics
  const vocabularyData = useVocabularyData()
  const { memorizedWords } = useMemorizedWords()

  // Calculate statistics
  const totalWords = vocabularyData.length
  const memorizedCount = memorizedWords.size

  const handleSignOut = () => {
    signOut()
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
    )
  }

  const initializeGoogleOAuth = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      if (window.google?.accounts?.oauth2) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) {
          throw new Error('Google Client ID not configured')
        }

        setGoogleLoaded(true)
        setGoogleError(null)
      } else {
        throw new Error('Google OAuth2 not loaded')
      }
    } catch (error) {
      console.error('Failed to initialize Google OAuth:', error)
      setGoogleError(
        error instanceof Error ? error.message : 'Failed to load Google OAuth'
      )
      setGoogleLoaded(false)
    }
  }, [])

  const handleOAuthSignIn = useCallback(async () => {
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2)
      return

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('Google Client ID not configured')
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/spreadsheets',
        ].join(' '),
        callback: async (response: any) => {
          if (response.error) {
            console.error('OAuth error:', response.error)
            setGoogleError('OAuth authorization failed')
            return
          }

          try {
            await signIn(response)
          } catch (error) {
            console.error('Sign in error:', error)
            setGoogleError('Sign in failed')
          }
        },
      })

      tokenClient.requestAccessToken({ prompt: 'consent' })
    } catch (error) {
      console.error('Failed to start OAuth flow:', error)
      setGoogleError('Failed to start sign-in')
    }
  }, [signIn])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Google OAuth library is already loaded
    if (window.google?.accounts?.oauth2) {
      initializeGoogleOAuth()
    } else {
      // Wait for Google library to load
      const checkGoogleLoaded = () => {
        if (window.google?.accounts?.oauth2) {
          initializeGoogleOAuth()
        } else {
          setTimeout(checkGoogleLoaded, 100)
        }
      }
      checkGoogleLoaded()
    }
  }, [initializeGoogleOAuth])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        {googleError ? (
          <div className="text-sm text-red-500">Sign-in unavailable</div>
        ) : googleLoaded ? (
          <Button
            onClick={handleOAuthSignIn}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.signInWithGoogle')}
          </Button>
        ) : (
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || 'User'}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />

        {/* Word Statistics */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{t('vocabulary.totalWords')}</span>
            </div>
            <span className="font-medium">{totalWords}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>{t('vocabulary.memorized')}</span>
            </div>
            <span className="font-medium">{memorizedCount}</span>
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('auth.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
