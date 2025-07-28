"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Sun, Moon, Settings, AlertTriangle, Shuffle, ChevronDown, ChevronUp } from "lucide-react"
import { useThemeStore, useThemeStyles } from "@/stores/themeStore"
import { 
  useVocabularyData, 
  useVocabularyLoading, 
  useVocabularyShuffled, 
  useSelectedDay, 
  useAvailableDays,
  useLoadVocabularyData,
  useCheckAndReloadForUser,
  useShuffleWords,
  useFilterByDay,
  useResetToOriginal,
  useUpdateWordTotal,
  useGetFilteredData
} from "@/stores/vocabularyStore"
import { useNavigationState } from "@/hooks/useNavigationState"
import { useMemorizedWords } from "@/hooks/useMemorizedWords"
import { VocabularyCard } from "./VocabularyCard"
import { NavigationControls } from "./NavigationControls"
import { vocabularyService } from "@/utils/vocabularyService"
import { useTranslation } from "@/hooks/useTranslation"

interface VocabularyPracticeProps {
  userId?: string | null
}

export default function VocabularyPractice({ 
  userId 
}: VocabularyPracticeProps) {
  
  // Authorization error state
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Filter collapse state
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  
  // Custom hooks
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const themeStyles = useThemeStyles()
  const { t } = useTranslation()
  // Vocabulary store selectors
  const vocabularyData = useVocabularyData()
  const isLoading = useVocabularyLoading()
  const isShuffled = useVocabularyShuffled()
  const selectedDay = useSelectedDay()
  const availableDays = useAvailableDays()
  const loadVocabularyData = useLoadVocabularyData()
  const checkAndReloadForUser = useCheckAndReloadForUser()
  const shuffleWords = useShuffleWords()
  const filterByDay = useFilterByDay()
  const resetToOriginal = useResetToOriginal()
  const getFilteredData = useGetFilteredData()
  const updateWordTotal = useUpdateWordTotal()
  
  const {
    currentIndex,
    setCurrentIndex,
    showChinese,
    setShowChinese,
    showPinyin,
    setShowPinyin,
    showKorean,
    setShowKorean,
    showMemorizedWords,
    setShowMemorizedWords,
    pinyinRevealed,
    setPinyinRevealed,
    koreanRevealed,
    setKoreanRevealed,
    chineseRevealed,
    resetRevealStates,
    resetCurrentIndex,
    nextWord: navigateNext,
    prevWord: navigatePrev,
    handleRevealChinese: revealChinese,
    useAutoChineseDisplay
  } = useNavigationState()
  
  const { memorizedWords, toggleMemorized, resetAllMemorizedWords } = useMemorizedWords()

  // Get filtered data
  const filteredVocabularyData = getFilteredData(memorizedWords, showMemorizedWords)
  
  // Get the current word
  const currentWord = filteredVocabularyData.length > 0
    ? filteredVocabularyData[Math.min(currentIndex, filteredVocabularyData.length - 1)]
    : { id: 0, chinese: "", pinyin: "", korean: "", total: 0, day: 0 }

  // Navigation functions
  const nextWord = () => navigateNext(filteredVocabularyData, currentWord)
  const prevWord = () => navigatePrev(filteredVocabularyData, currentWord)
  const handleRevealChinese = () => revealChinese(currentWord, updateWordTotal)
  const handleToggleMemorized = async (wordId: number) => {
    const result = await toggleMemorized(wordId, currentWord)
    if (!result.success && result.error) {
      setAuthError(result.error)
      // Clear error after 5 seconds
      setTimeout(() => setAuthError(null), 5000)
    }
  }

  // Handle filter changes that might affect current index
  const handleFilterByDay = (day: number | null) => {
    filterByDay(day)
    setCurrentIndex(0)
    resetRevealStates()
  }

  const handleShuffleWords = () => {
    shuffleWords()
    setCurrentIndex(0)
    resetRevealStates()
  }

  const handleResetToOriginal = () => {
    resetToOriginal()
    setCurrentIndex(0)
    resetRevealStates()
  }

  // Reset current index when filtered data changes
  useEffect(() => {
    resetCurrentIndex(filteredVocabularyData.length)
  }, [showMemorizedWords, memorizedWords, filteredVocabularyData.length, currentIndex, resetCurrentIndex])

  // Load vocabulary data on mount
  useEffect(() => {
    loadVocabularyData()
  }, []) // Empty dependency array for initial load only

  // Check for user changes and reload vocabulary if needed
  useEffect(() => {
    checkAndReloadForUser(userId ?? null)
  }, [userId]) // Only depend on userId changes

  // Handle automatic Chinese display
  useAutoChineseDisplay(isLoading, vocabularyData.length, currentWord, updateWordTotal)

  // Handle data migration
  const handleMigrateData = async (spreadsheetId?: string) => {
    try {
      const result = await vocabularyService.migrateDataFromSheets(spreadsheetId)
      
      if (result.success) {
        // Refresh the vocabulary data after successful migration
        window.location.reload()
      } else {
        setAuthError(result.error || 'Migration failed')
        setTimeout(() => setAuthError(null), 5000)
      }
    } catch (error) {
      console.error('Migration error:', error)
      setAuthError('Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setTimeout(() => setAuthError(null), 5000)
    }
  }

  return (
    <div
      className={`${themeStyles.background} p-4 relative transition-colors duration-300`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 ${themeStyles.decorativeBlur} rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeStyles.decorativeBlur} rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${themeStyles.decorativeBlurLight} rounded-full blur-3xl`}
        ></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Authorization Error Alert */}
        {authError && (
          <Alert className="mb-2 border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300 flex-shrink-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
        )}

        {/* Word Order & Filtering Controls */}
        {!isLoading && vocabularyData.length > 0 && (
          <div className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-2xl ${themeStyles.glassBorder} mb-2 flex-shrink-0`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleShuffleWords}
                  disabled={vocabularyData.length === 0}
                  className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                >
                  <Shuffle className="h-4 w-4" />
                  {t('vocabulary.shuffleWords')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetToOriginal}
                  disabled={vocabularyData.length === 0 || (!isShuffled && selectedDay === null)}
                  className={`gap-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
                >
                  {t('vocabulary.resetOrder')}
                </Button>
              </div>

              {availableDays.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={`text-sm font-medium ${themeStyles.secondaryText}`}>{t('vocabulary.dayFilter')}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                      className={`p-1 h-6 w-6 ${themeStyles.mainText} hover:bg-white/20`}
                    >
                      {isFilterCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </div>
                  {!isFilterCollapsed && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterByDay(null)}
                        className={`backdrop-blur-md ${themeStyles.buttonGlass} ${selectedDay === null ? 'border-2 border-blue-500 text-black dark:text-white' : themeStyles.glassBorderStrong + ' ' + themeStyles.mainText} ${themeStyles.buttonGlassHover}`}
                      >
                        {t('vocabulary.allDays')}
                      </Button>
                      {availableDays.map(day => (
                        <Button
                          key={day}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilterByDay(day)}
                          className={`backdrop-blur-md ${themeStyles.buttonGlass} ${selectedDay === day ? 'border-2 border-blue-500 text-black dark:text-white' : themeStyles.glassBorderStrong + ' ' + themeStyles.mainText} ${themeStyles.buttonGlassHover}`}
                        >
                          {t('vocabulary.day')} {day}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="px-5 space-y-4">
          <VocabularyCard
            currentWord={currentWord}
            isLoading={isLoading}
            vocabularyDataLength={filteredVocabularyData.length}
            memorizedWords={memorizedWords}
            showChinese={showChinese}
            showPinyin={showPinyin}
            showKorean={showKorean}
            pinyinRevealed={pinyinRevealed}
            setPinyinRevealed={setPinyinRevealed}
            koreanRevealed={koreanRevealed}
            setKoreanRevealed={setKoreanRevealed}
            chineseRevealed={chineseRevealed}
            handleRevealChinese={handleRevealChinese}
            toggleMemorized={handleToggleMemorized}
            themeStyles={themeStyles}
            showMemorizedWords={showMemorizedWords}
          />

          {/* Navigation */}
          {!isLoading && filteredVocabularyData.length > 0 && (
            <div className="flex-shrink-0">
              <NavigationControls
                currentIndex={currentIndex}
                filteredDataLength={filteredVocabularyData.length}
                memorizedWords={memorizedWords}
                showMemorizedWords={showMemorizedWords}
                nextWord={nextWord}
                prevWord={prevWord}
                themeStyles={themeStyles}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}