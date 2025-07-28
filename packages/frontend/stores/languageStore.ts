import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'ko'

interface LanguageState {
  language: Language
  isLoaded: boolean
  setLanguage: (language: Language) => void
  setIsLoaded: (loaded: boolean) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ko', // Default to Korean since this is primarily for Korean users
      isLoaded: false,
      setLanguage: (language: Language) => {
        set({ language })
      },
      setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
    }),
    {
      name: 'language-preference',
      onRehydrateStorage: () => state => {
        if (state) {
          state.setIsLoaded(true)
        }
      },
    }
  )
)
