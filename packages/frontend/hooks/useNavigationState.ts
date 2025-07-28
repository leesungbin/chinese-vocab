import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { vocabularyService, type VocabItem } from '@/utils/vocabularyService'

export function useNavigationState() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasShownChinese, setHasShownChinese] = useState(false)

  // Display settings
  const [showChinese, setShowChinese] = useLocalStorage('showChinese', true)
  const [showPinyin, setShowPinyin] = useLocalStorage('showPinyin', false)
  const [showKorean, setShowKorean] = useLocalStorage('showKorean', false)
  const [showMemorizedWords, setShowMemorizedWords] = useLocalStorage(
    'showMemorizedWords',
    true
  )

  // Reveal states
  const [pinyinRevealed, setPinyinRevealed] = useState(false)
  const [koreanRevealed, setKoreanRevealed] = useState(false)
  const [chineseRevealed, setChineseRevealed] = useState(false)

  // Reset reveal states based on settings
  const resetRevealStates = () => {
    setPinyinRevealed(showPinyin)
    setKoreanRevealed(showKorean)
    setChineseRevealed(showChinese)
    setHasShownChinese(showChinese)
  }

  // Reset current index when filtered data changes
  const resetCurrentIndex = (filteredLength: number) => {
    if (filteredLength > 0 && currentIndex >= filteredLength) {
      setCurrentIndex(0)
      resetRevealStates()
    }
  }

  const nextWord = (filteredData: VocabItem[], currentWord: VocabItem) => {
    if (filteredData.length === 0) return

    // Call increment API for the current word if it was shown (asynchronously)
    if (hasShownChinese && currentWord.id > 0) {
      vocabularyService.incrementWordTotal(currentWord.chinese).catch(error => {
        console.error('Error updating word count:', error)
      })
    }

    setCurrentIndex(prev => (prev + 1) % filteredData.length)
    resetRevealStates()
  }

  const prevWord = (filteredData: VocabItem[], currentWord: VocabItem) => {
    if (filteredData.length === 0) return

    // Call increment API for the current word if it was shown (asynchronously)
    if (hasShownChinese && currentWord.id > 0) {
      vocabularyService.incrementWordTotal(currentWord.chinese).catch(error => {
        console.error('Error updating word count:', error)
      })
    }

    setCurrentIndex(
      prev => (prev - 1 + filteredData.length) % filteredData.length
    )
    resetRevealStates()
  }

  const handleChineseShown = (
    currentWord: VocabItem,
    updateWordTotal: (wordId: number) => void
  ) => {
    if (!hasShownChinese && currentWord.id > 0) {
      setHasShownChinese(true)
      updateWordTotal(currentWord.id)
    }
  }

  const handleRevealChinese = (
    currentWord: VocabItem,
    updateWordTotal: (wordId: number) => void
  ) => {
    setChineseRevealed(true)
    handleChineseShown(currentWord, updateWordTotal)
  }

  // Effect for handling automatic Chinese display when showChinese is true
  const useAutoChineseDisplay = (
    isLoading: boolean,
    vocabularyDataLength: number,
    currentWord: VocabItem,
    updateWordTotal: (wordId: number) => void
  ) => {
    useEffect(() => {
      if (showChinese && !isLoading && vocabularyDataLength > 0) {
        handleChineseShown(currentWord, updateWordTotal)
      }
    }, [currentIndex, showChinese, isLoading, vocabularyDataLength])
  }

  return {
    currentIndex,
    setCurrentIndex,
    hasShownChinese,
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
    setChineseRevealed,
    resetRevealStates,
    resetCurrentIndex,
    nextWord,
    prevWord,
    handleChineseShown,
    handleRevealChinese,
    useAutoChineseDisplay,
  }
}
