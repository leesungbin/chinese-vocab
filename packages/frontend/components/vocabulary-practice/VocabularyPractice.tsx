"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sun, Moon, Settings, AlertTriangle } from "lucide-react"
import { useThemeStore, useThemeStyles } from "@/stores/themeStore"
import { useVocabularyData } from "@/hooks/useVocabularyData"
import { useNavigationState } from "@/hooks/useNavigationState"
import { useMemorizedWords } from "@/hooks/useMemorizedWords"
import { VocabularyCard } from "./VocabularyCard"
import { SettingsModal } from "./SettingsModal"
import { NavigationControls } from "./NavigationControls"
import { vocabularyService } from "@/utils/vocabularyService"

interface VocabularyPracticeProps {
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

export default function VocabularyPractice({ 
  settingsOpen, 
  setSettingsOpen 
}: VocabularyPracticeProps) {
  
  // Authorization error state
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Custom hooks
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const themeStyles = useThemeStyles()
  const { 
    vocabularyData, 
    isLoading, 
    isShuffled, 
    selectedDay, 
    availableDays,
    shuffleWords,
    filterByDay,
    resetToOriginal,
    getFilteredData,
    updateWordTotal
  } = useVocabularyData()
  
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
      className={`min-h-screen ${themeStyles.background} p-4 relative overflow-hidden transition-colors duration-300`}
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

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Authorization Error Alert */}
        {authError && (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
        )}

        {/* Reduced top margin since title is removed */}
        <div className="mb-4"></div>

        {/* Settings Modal */}
        <SettingsModal
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          showChinese={showChinese}
          setShowChinese={setShowChinese}
          showPinyin={showPinyin}
          setShowPinyin={setShowPinyin}
          showKorean={showKorean}
          setShowKorean={setShowKorean}
          showMemorizedWords={showMemorizedWords}
          setShowMemorizedWords={setShowMemorizedWords}
          vocabularyDataLength={vocabularyData.length}
          shuffleWords={handleShuffleWords}
          resetToOriginal={handleResetToOriginal}
          isShuffled={isShuffled}
          selectedDay={selectedDay}
          availableDays={availableDays}
          filterByDay={handleFilterByDay}
          memorizedWords={memorizedWords}
          resetAllMemorizedWords={resetAllMemorizedWords}
          resetRevealStates={resetRevealStates}
          themeStyles={themeStyles}
          onMigrateData={handleMigrateData}
        />

        {/* Main Vocabulary Card */}
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
          <NavigationControls
            currentIndex={currentIndex}
            filteredDataLength={filteredVocabularyData.length}
            memorizedWords={memorizedWords}
            showMemorizedWords={showMemorizedWords}
            nextWord={nextWord}
            prevWord={prevWord}
            themeStyles={themeStyles}
          />
        )}

        {/* Loading Progress Bar */}
        {isLoading && (
          <div
            className={`backdrop-blur-md ${themeStyles.glassBackground} rounded-full h-3 ${themeStyles.glassBorder} overflow-hidden`}
          >
            <div
              className={`${themeStyles.progressFill} h-full rounded-full animate-pulse`}
              style={{ width: '30%' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}