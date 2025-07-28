'use client'

import { useAuth } from '@/hooks/useAuth'
import VocabularyPractice from '@/components/vocabulary-practice/VocabularyPractice'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { useThemeStore, useThemeStyles } from '@/stores/themeStore'
import { useTranslation } from '@/hooks/useTranslation'
import { NavigationBar } from '@/components/navigation/NavigationBar'

export default function ProtectedVocabulary() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const isLoaded = useThemeStore(state => state.isLoaded)
  const themeStyles = useThemeStyles()
  const { t } = useTranslation()

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={themeStyles.background}>
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-10">
        {!isAuthenticated && (
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You can view vocabulary words, but you need to sign in with Google
              to save your progress and mark words as memorized.
            </AlertDescription>
          </Alert>
        )}

        <VocabularyPractice userId={user?.id || null} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Seongbin Lee
              <span className="mx-2">•</span>
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
