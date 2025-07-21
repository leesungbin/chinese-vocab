"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Settings } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { useVocabularyData } from "@/hooks/useVocabularyData"
import { useNavigationState } from "@/hooks/useNavigationState"
import { useMemorizedWords } from "@/hooks/useMemorizedWords"
import { VocabularyCard } from "./VocabularyCard"
import { SettingsModal } from "./SettingsModal"
import { NavigationControls } from "./NavigationControls"

export default function VocabularyPractice() {
  const [settingsOpen, setSettingsOpen] = useState(true)
  
  // Custom hooks
  const { isDarkMode, toggleTheme, themeStyles } = useTheme()
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
  const handleToggleMemorized = (wordId: number) => toggleMemorized(wordId, currentWord)

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
        {/* Header with theme toggle and settings */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className={`text-3xl font-bold ${themeStyles.mainText} mb-2`}>Chinese Vocabulary Practice</h1>
            <p className={themeStyles.secondaryText}>
              Practice Chinese characters with pronunciation and Korean meanings
            </p>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={`backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className={`ml-2 backdrop-blur-md ${themeStyles.buttonGlass} ${themeStyles.glassBorderStrong} ${themeStyles.buttonGlassHover} ${themeStyles.mainText}`}
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

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