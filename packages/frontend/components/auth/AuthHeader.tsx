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
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function AuthHeader() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth()
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleSignOut = () => {
    signOut()
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
    )
  }

  const initializeGoogleSignIn = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      if (window.google?.accounts?.id) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId) {
          throw new Error('Google Client ID not configured')
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: signIn,
          auto_select: false,
          itp_support: true,
        })

        // Enable One Tap login for better UX
        if (!isAuthenticated) {
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // One Tap was not displayed or was skipped, fallback to button
              console.log('One Tap not shown:', notification.getNotDisplayedReason())
            }
          })
        }

        setGoogleLoaded(true)
        setGoogleError(null)
      } else {
        throw new Error('Google Identity Services not loaded')
      }
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error)
      setGoogleError(error instanceof Error ? error.message : 'Failed to load Google Sign-In')
      setGoogleLoaded(false)
    }
  }, [signIn, isAuthenticated])

  const renderGoogleButton = useCallback(() => {
    if (!googleLoaded || typeof window === 'undefined') return

    const buttonContainer = document.getElementById('google-signin-button')
    if (buttonContainer && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
          logo_alignment: 'left'
        })
      } catch (error) {
        console.error('Failed to render Google Sign-In button:', error)
        setGoogleError('Failed to render sign-in button')
      }
    }
  }, [googleLoaded])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Google library is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn()
    } else {
      // Wait for Google library to load
      const checkGoogleLoaded = () => {
        if (window.google?.accounts?.id) {
          initializeGoogleSignIn()
        } else {
          setTimeout(checkGoogleLoaded, 100)
        }
      }
      checkGoogleLoaded()
    }
  }, [initializeGoogleSignIn])

  useEffect(() => {
    if (googleLoaded) {
      renderGoogleButton()
    }
  }, [googleLoaded, renderGoogleButton])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        {googleError ? (
          <div className="text-sm text-red-500">
            Sign-in unavailable
          </div>
        ) : (
          <div id="google-signin-button" />
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
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}