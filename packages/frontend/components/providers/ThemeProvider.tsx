'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { useLanguageStore } from '@/stores/languageStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const setIsLoaded = useThemeStore(state => state.setIsLoaded)
  const setLanguageLoaded = useLanguageStore(state => state.setIsLoaded)

  useEffect(() => {
    // Mark stores as loaded after hydration
    setIsLoaded(true)
    setLanguageLoaded(true)
  }, [setIsLoaded, setLanguageLoaded])

  return <>{children}</>
}
