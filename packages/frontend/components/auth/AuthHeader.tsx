'use client'

import { useEffect } from 'react'
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

  const handleSignOut = () => {
    signOut()
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
    )
  }

  // Set up the global callback function and render Google Sign-In button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleGoogleSignIn = signIn
      
      // Initialize Google Identity Services and render the button
      if ((window as any).google && (window as any).google.accounts) {
        (window as any).google.accounts.id.initialize({
          client_id: "62679414399-ffhnilqravrlgarp1hspq6q2k5vq2ig8.apps.googleusercontent.com",
          callback: signIn,
          auto_select: false,
          itp_support: true,
        })
        
        // Render the sign-in button
        setTimeout(() => {
          const buttonContainer = document.getElementById('google-signin-button')
          if (buttonContainer) {
            (window as any).google.accounts.id.renderButton(buttonContainer, {
              type: 'standard',
              shape: 'rectangular',
              theme: 'outline',
              text: 'signin_with',
              size: 'large',
              logo_alignment: 'left'
            })
          }
        }, 100)
      }
    }
  }, [signIn])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <div id="google-signin-button" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
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