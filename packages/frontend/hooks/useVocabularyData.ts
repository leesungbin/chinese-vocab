import { useState, useEffect } from 'react'
import { vocabularyService, type VocabItem } from '@/utils/vocabularyService'

export function useVocabularyData() {
  const [vocabularyData, setVocabularyData] = useState<VocabItem[]>([])
  const [originalData, setOriginalData] = useState<VocabItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShuffled, setIsShuffled] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [availableDays, setAvailableDays] = useState<number[]>([])

  // Fetch vocabulary data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await vocabularyService.fetchVocabularyData()
        if (data.length > 0) {
          setOriginalData(data)
          setVocabularyData(data)
          // Extract unique days from the data
          const days = [...new Set(data.map(item => item.day).filter(day => day && day > 0))]
            .filter(e => typeof e === 'number')
            .sort((a, b) => a - b)
          setAvailableDays(days)
        }
      } catch (error) {
        console.error('Failed to load vocabulary data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const shuffleWords = () => {
    if (vocabularyData.length === 0) return
    const shuffled = [...vocabularyData].sort(() => Math.random() - 0.5)
    setVocabularyData(shuffled)
    setIsShuffled(true)
  }

  const filterByDay = (day: number | null) => {
    setSelectedDay(day)

    if (day === null) {
      // Show all words
      setVocabularyData(isShuffled ? [...originalData].sort(() => Math.random() - 0.5) : originalData)
    } else {
      // Filter by specific day
      const filtered = originalData.filter(item => item.day === day)
      setVocabularyData(isShuffled ? [...filtered].sort(() => Math.random() - 0.5) : filtered)
    }
  }

  const resetToOriginal = () => {
    setVocabularyData(originalData)
    setIsShuffled(false)
    setSelectedDay(null)
  }

  const getFilteredData = (memorizedWords: Set<number>, showMemorizedWords: boolean) => {
    if (showMemorizedWords) {
      return vocabularyData
    }
    return vocabularyData.filter(word => !memorizedWords.has(word.id))
  }

  const updateWordTotal = (wordId: number) => {
    setVocabularyData(prev => prev.map(item =>
      item.id === wordId
        ? { ...item, total: (item.total || 0) + 1 }
        : item
    ))
  }

  return {
    vocabularyData,
    originalData,
    isLoading,
    isShuffled,
    selectedDay,
    availableDays,
    shuffleWords,
    filterByDay,
    resetToOriginal,
    getFilteredData,
    updateWordTotal
  }
}