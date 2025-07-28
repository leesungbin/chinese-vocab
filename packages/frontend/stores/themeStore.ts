import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'

interface ThemeStyles {
  background: string
  decorativeBlur: string
  decorativeBlurLight: string
  mainText: string
  secondaryText: string
  tertiaryText: string
  glassBackground: string
  glassBackgroundStrong: string
  glassBorder: string
  glassBorderStrong: string
  buttonGlass: string
  buttonGlassHover: string
  progressFill: string
}

interface ThemeState {
  isDarkMode: boolean
  isLoaded: boolean
  toggleTheme: () => void
  setIsLoaded: (loaded: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      isLoaded: false,
      toggleTheme: () => {
        const newMode = !get().isDarkMode
        set({ isDarkMode: newMode })

        // Apply dark class to HTML element for Tailwind dark mode
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
    }),
    {
      name: 'isDarkMode',
      onRehydrateStorage: () => state => {
        if (state) {
          state.setIsLoaded(true)

          // Apply theme on rehydration
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
    }
  )
)

// Hook to get theme styles based on current theme state
export const useThemeStyles = (): ThemeStyles => {
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  return useMemo(
    () => ({
      background: isDarkMode ? 'bg-black' : 'bg-gray-50',
      decorativeBlur: isDarkMode ? 'bg-white/5' : 'bg-white/30',
      decorativeBlurLight: isDarkMode ? 'bg-white/3' : 'bg-white/20',
      mainText: isDarkMode ? 'text-white' : 'text-gray-900',
      secondaryText: isDarkMode ? '!text-gray-200' : '!text-gray-600',
      tertiaryText: isDarkMode ? 'text-gray-300' : 'text-gray-500',
      glassBackground: isDarkMode ? 'bg-white/10' : 'bg-white/60',
      glassBackgroundStrong: isDarkMode ? 'bg-white/15' : 'bg-white/80',
      glassBorder: isDarkMode ? 'border-white/20' : 'border-white/40',
      glassBorderStrong: isDarkMode ? 'border-white/30' : 'border-white/60',
      buttonGlass: isDarkMode ? 'bg-white/20' : 'bg-white/70',
      buttonGlassHover: isDarkMode ? 'hover:bg-white/30' : 'hover:bg-white/90',
      progressFill: isDarkMode ? 'bg-white' : 'bg-black',
    }),
    [isDarkMode]
  )
}
