'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import VocabularyPractice from '@/components/vocabulary-practice/VocabularyPractice'
import { AuthHeader } from './AuthHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InfoIcon, Sun, Moon, Settings } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function ProtectedVocabulary() {
  const { isAuthenticated, isLoading, signIn } = useAuth()
  const { isDarkMode, toggleTheme, themeStyles, isLoaded } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeStyles.background}`}>
      {/* Header with auth controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className={`text-xl font-semibold ${themeStyles.mainText}`}>
              HSK 4급 중국어 단어 암기
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <AuthHeader />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!isAuthenticated && (
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You can view vocabulary words, but you need to sign in with Google to save your progress and mark words as memorized.
            </AlertDescription>
          </Alert>
        )}
        
        <VocabularyPractice 
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
        />
      </div>
    </div>
  )
}