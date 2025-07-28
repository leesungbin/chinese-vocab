'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Download,
  Loader2,
  ExternalLink,
  Plus,
  AlertTriangle,
  Languages,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { vocabularyService } from '@/utils/vocabularyService'
import { useThemeStore, useThemeStyles } from '@/stores/themeStore'
import { useLanguageStore, type Language } from '@/stores/languageStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { useNavigationState } from '@/hooks/useNavigationState'
import { useMemorizedWords } from '@/hooks/useMemorizedWords'
import { useAvailableDays, useVocabularyData } from '@/stores/vocabularyStore'
import { NavigationBar } from '@/components/navigation/NavigationBar'

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const toggleTheme = useThemeStore(state => state.toggleTheme)
  const themeStyles = useThemeStyles()

  const language = useLanguageStore(state => state.language)
  const setLanguage = useLanguageStore(state => state.setLanguage)
  const { t } = useTranslation()

  // Navigation state hooks for display settings
  const {
    showChinese,
    setShowChinese,
    showPinyin,
    setShowPinyin,
    showKorean,
    setShowKorean,
    showMemorizedWords,
    setShowMemorizedWords,
    resetRevealStates,
  } = useNavigationState()

  // Memorized words hooks
  const {
    memorizedWords,
    resetAllMemorizedWords,
    resetMemorizedWordsByDay,
    getMemorizedWordCountByDay,
  } = useMemorizedWords()

  // Vocabulary data hooks
  const availableDays = useAvailableDays()
  const vocabularyData = useVocabularyData()

  // State management (moved from SettingsModal)
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [isMigrating, setIsMigrating] = useState(false)
  const [isLoadingSpreadsheetId, setIsLoadingSpreadsheetId] = useState(false)
  const [isCreatingSpreadsheet, setIsCreatingSpreadsheet] = useState(false)
  const [hasTriedAutoCreate, setHasTriedAutoCreate] = useState(false)
  const [createSpreadsheetError, setCreateSpreadsheetError] = useState<
    string | null
  >(null)

  const handleResetMemorizedWords = () => {
    resetAllMemorizedWords()
    resetRevealStates()
  }

  const getErrorMessage = (
    error: string
  ): { title: string; message: string; suggestion: string } => {
    if (error.includes('Drive storage quota has been exceeded')) {
      return {
        title: 'Google Drive Storage Full',
        message:
          'Your Google Drive storage is full and cannot create new files.',
        suggestion:
          'Please free up space in your Google Drive or upgrade your storage plan, then try again.',
      }
    }

    if (error.includes('permission') || error.includes('Permission')) {
      return {
        title: 'Permission Error',
        message: 'Unable to create spreadsheet due to permission restrictions.',
        suggestion:
          'Please check your Google account permissions and try again.',
      }
    }

    if (error.includes('quota') || error.includes('Quota')) {
      return {
        title: 'API Quota Exceeded',
        message: 'Google Sheets API quota has been exceeded.',
        suggestion:
          'Please try again later or contact support if the issue persists.',
      }
    }

    if (
      error.includes('network') ||
      error.includes('Network') ||
      error.includes('Failed to fetch')
    ) {
      return {
        title: 'Network Error',
        message: 'Unable to connect to Google Sheets service.',
        suggestion: 'Please check your internet connection and try again.',
      }
    }

    // Default error message
    return {
      title: 'Spreadsheet Creation Failed',
      message:
        'An unexpected error occurred while creating your personal Google Sheet.',
      suggestion:
        'You can manually enter your Google Sheets ID below or try again later.',
    }
  }

  // Load user's current spreadsheet ID when page opens, and auto-create if needed
  useEffect(() => {
    const loadSpreadsheetId = async () => {
      if (!spreadsheetId && !hasTriedAutoCreate) {
        setIsLoadingSpreadsheetId(true)
        try {
          const result = await vocabularyService.getUserSpreadsheetId()
          if (result.success && result.spreadsheetId) {
            setSpreadsheetId(result.spreadsheetId)
            setHasTriedAutoCreate(true)
          } else {
            // No existing spreadsheet - check if user is authenticated
            const token = localStorage.getItem('auth-token')
            if (token && !hasTriedAutoCreate) {
              // User is authenticated but has no spreadsheet - auto-create one
              setIsLoadingSpreadsheetId(false)
              try {
                await handleCreateSpreadsheet()
              } catch (error) {
                console.error('Auto-create spreadsheet failed:', error)
              }
              return
            }
          }
        } catch (error) {
          console.error('Failed to load spreadsheet ID:', error)
        } finally {
          setIsLoadingSpreadsheetId(false)
        }
      }
    }

    loadSpreadsheetId()
  }, [spreadsheetId, hasTriedAutoCreate])

  const handleMigrateData = async () => {
    setIsMigrating(true)
    try {
      const result = await vocabularyService.migrateDataFromSheets(
        spreadsheetId.trim() || undefined
      )

      if (result.success) {
        // Refresh the vocabulary data after successful migration
        window.location.reload()
      } else {
        setCreateSpreadsheetError(result.error || 'Migration failed')
        setTimeout(() => setCreateSpreadsheetError(null), 5000)
      }
    } catch (error) {
      console.error('Migration error:', error)
      setCreateSpreadsheetError(
        'Migration failed: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
      setTimeout(() => setCreateSpreadsheetError(null), 5000)
    } finally {
      setIsMigrating(false)
    }
  }

  const handleCreateSpreadsheet = async () => {
    setIsCreatingSpreadsheet(true)
    setCreateSpreadsheetError(null) // Clear any previous errors

    try {
      const result = await vocabularyService.createUserSpreadsheet()

      if (result.success && result.spreadsheetId) {
        setSpreadsheetId(result.spreadsheetId)
        setHasTriedAutoCreate(true)
        setCreateSpreadsheetError(null) // Clear any errors on success

        // Show success message if it's a new sheet
        if (result.isNew) {
          console.log('Successfully created your personal Google Sheet!')
        }
      } else {
        // Handle API errors
        const errorMessage = result.error || 'Unknown error occurred'
        setCreateSpreadsheetError(errorMessage)
        setHasTriedAutoCreate(true)
        console.error('Failed to create spreadsheet:', errorMessage)
      }
    } catch (error) {
      // Handle network/unexpected errors
      const errorMessage =
        error instanceof Error ? error.message : 'Network error occurred'
      setCreateSpreadsheetError(errorMessage)
      setHasTriedAutoCreate(true)
      console.error('Error creating spreadsheet:', error)
    } finally {
      setIsCreatingSpreadsheet(false)
    }
  }

  const handleGoToGoogleSheet = () => {
    const currentSpreadsheetId = spreadsheetId.trim()
    if (currentSpreadsheetId) {
      // Open user's specific Google Sheet
      window.open(
        `https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`,
        '_blank'
      )
    } else {
      // If no spreadsheet ID, show a message or use default anonymous sheet
      // Using the anonymous sheet ID as fallback
      const anonymousSheetId = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I'
      window.open(
        `https://docs.google.com/spreadsheets/d/${anonymousSheetId}/edit`,
        '_blank'
      )
    }
  }

  return (
    <div className={`min-h-screen ${themeStyles.background} flex flex-col`}>
      {/* Navigation Bar */}
      <NavigationBar showHomeButton={true} />

      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${themeStyles.mainText}`}>
              {t('settings.title')}
            </h1>
          </div>

          <div
            className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-2xl ${themeStyles.glassBorder} p-6 space-y-8`}
          >
            {/* Error Dialog for Spreadsheet Creation */}
            {createSpreadsheetError && (
              <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">
                      {getErrorMessage(createSpreadsheetError).title}
                    </div>
                    <div>{getErrorMessage(createSpreadsheetError).message}</div>
                    <div className="text-sm opacity-90">
                      {getErrorMessage(createSpreadsheetError).suggestion}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateSpreadsheetError(null)}
                      className="mt-2 h-7 text-xs border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Theme and Language Settings */}
            <section>
              <h2
                className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}
              >
                {t('settings.appearanceLanguage')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="dark-mode"
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('theme.darkMode')}
                  </Label>
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="language"
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('language.changeLanguage')}
                  </Label>
                  <Select
                    value={language}
                    onValueChange={(value: Language) => setLanguage(value)}
                  >
                    <SelectTrigger
                      className={`w-32 backdrop-blur-md ${themeStyles.glassBorderStrong} ${themeStyles.mainText} bg-white/80 dark:bg-gray-800/80`}
                    >
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className={`backdrop-blur-md ${themeStyles.glassBackground} ${themeStyles.glassBorder}`}
                    >
                      <SelectItem value="ko">{t('language.korean')}</SelectItem>
                      <SelectItem value="en">
                        {t('language.english')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Display Settings */}
            <section>
              <h2
                className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}
              >
                {t('settings.displaySettings')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="show-chinese"
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('settings.showChinese')}
                  </Label>
                  <Switch
                    id="show-chinese"
                    checked={showChinese}
                    onCheckedChange={setShowChinese}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="show-pinyin"
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('settings.showPinyin')}
                  </Label>
                  <Switch
                    id="show-pinyin"
                    checked={showPinyin}
                    onCheckedChange={setShowPinyin}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="show-korean"
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('settings.showKorean')}
                  </Label>
                  <Switch
                    id="show-korean"
                    checked={showKorean}
                    onCheckedChange={setShowKorean}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="show-memorized"
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('settings.showMemorized')}
                  </Label>
                  <Switch
                    id="show-memorized"
                    checked={showMemorizedWords}
                    onCheckedChange={setShowMemorizedWords}
                  />
                </div>
              </div>
            </section>

            {/* Data Migration Section */}
            {isAuthenticated && (
              <section>
                <h2
                  className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}
                >
                  {t('settings.dataMigration')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="spreadsheet-id"
                      className={`text-sm font-medium ${themeStyles.secondaryText} mb-2 block`}
                    >
                      {isCreatingSpreadsheet
                        ? t('settings.creatingSheet')
                        : t('settings.spreadsheetId')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="spreadsheet-id"
                        value={spreadsheetId}
                        onChange={e => setSpreadsheetId(e.target.value)}
                        placeholder={
                          isCreatingSpreadsheet
                            ? t('settings.creatingSheet')
                            : isLoadingSpreadsheetId
                              ? t('common.loading')
                              : t('settings.spreadsheetId')
                        }
                        disabled={
                          isMigrating ||
                          isLoadingSpreadsheetId ||
                          isCreatingSpreadsheet
                        }
                        className={`flex-1 backdrop-blur-md ${themeStyles.glassBorderStrong} ${themeStyles.mainText} bg-white/80 dark:bg-gray-800/80 placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleGoToGoogleSheet}
                        disabled={
                          isMigrating ||
                          isLoadingSpreadsheetId ||
                          isCreatingSpreadsheet
                        }
                        className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                        aria-label="Open Google Sheet"
                        title="Open Google Sheet in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Show create button if authenticated user has no spreadsheet and auto-create failed/not tried */}
                  {!spreadsheetId &&
                    hasTriedAutoCreate &&
                    !isCreatingSpreadsheet &&
                    localStorage.getItem('auth-token') && (
                      <Button
                        onClick={handleCreateSpreadsheet}
                        disabled={isCreatingSpreadsheet}
                        className={`w-full gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                      >
                        <Plus className="h-4 w-4" />
                        {t('settings.createPersonalSheet')}
                      </Button>
                    )}

                  <Button
                    onClick={handleMigrateData}
                    disabled={isMigrating}
                    className={`w-full gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                  >
                    {isMigrating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('settings.migratingData')}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        {t('settings.loadData')}
                      </>
                    )}
                  </Button>
                </div>
              </section>
            )}

            {/* Memorized Words Reset */}
            <section>
              <h2
                className={`text-lg font-semibold ${themeStyles.mainText} mb-4`}
              >
                {t('settings.resetMemorizedWords')}
              </h2>
              <div className="space-y-4">
                {/* Reset All */}
                <div className="flex items-center justify-between">
                  <Label
                    className={`text-sm font-medium ${themeStyles.secondaryText}`}
                  >
                    {t('settings.resetAll')}
                  </Label>
                  <Button
                    variant="outline"
                    disabled={memorizedWords.size === 0}
                    onClick={handleResetMemorizedWords}
                    className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                  >
                    {t('settings.resetAll')} ({memorizedWords.size})
                  </Button>
                </div>

                {/* Reset by Day */}
                {availableDays.length > 0 && (
                  <div className="space-y-3">
                    <Label
                      className={`text-sm font-medium ${themeStyles.secondaryText}`}
                    >
                      {t('settings.resetByDay')}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableDays.map(day => {
                        const memorizedInDay = getMemorizedWordCountByDay(day)
                        const totalInDay = vocabularyData.filter(
                          word => word.day === day
                        ).length
                        return (
                          <div
                            key={day}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-medium ${themeStyles.mainText}`}
                              >
                                {t('vocabulary.day')} {day}
                              </span>
                              <span
                                className={`text-xs ${themeStyles.secondaryText}`}
                              >
                                {memorizedInDay}/{totalInDay}
                                {t('settings.memorizedCount')}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={memorizedInDay === 0}
                              onClick={() => resetMemorizedWordsByDay(day)}
                              className={`gap-1 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                            >
                              {t('common.reset')} ({memorizedInDay})
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
