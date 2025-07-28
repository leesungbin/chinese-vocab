'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Settings, HelpCircle, Languages, Home } from 'lucide-react'
import { useThemeStore, useThemeStyles } from '@/stores/themeStore'
import { useLanguageStore, type Language } from '@/stores/languageStore'
import { useTranslation } from '@/hooks/useTranslation'
import { AuthHeader } from '@/components/auth/AuthHeader'

interface NavigationBarProps {
  showHomeButton?: boolean
}

export function NavigationBar({ showHomeButton = false }: NavigationBarProps) {
  const router = useRouter()
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const toggleTheme = useThemeStore(state => state.toggleTheme)
  const themeStyles = useThemeStyles()

  const language = useLanguageStore(state => state.language)
  const setLanguage = useLanguageStore(state => state.setLanguage)
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-gray-800 flex-shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4 px-4">
          {/* Left side - Home button when needed */}
          <div className="flex items-center">
            {showHomeButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/')}
                className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Go to home"
              >
                <Home className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Right side - Navigation controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={
                isDarkMode ? t('theme.switchToLight') : t('theme.switchToDark')
              }
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 gap-1"
              aria-label={t('language.changeLanguage')}
            >
              <Languages className="h-4 w-4" />
              {language === 'ko' ? 'EN' : '한'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/settings')}
              className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={t('navigation.settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/help')}
              className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={t('navigation.help')}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <AuthHeader />
          </div>
        </div>
      </div>
    </div>
  )
}
