import { useMemorizedWordsStorage } from './useLocalStorage'
import { vocabularyService, type VocabItem } from '@/utils/vocabularyService'
import { useVocabularyData } from '@/stores/vocabularyStore'

export function useMemorizedWords() {
  const { memorizedWords, setMemorizedWords, resetMemorizedWords } =
    useMemorizedWordsStorage()
  const vocabularyData = useVocabularyData()

  const toggleMemorized = async (
    wordId: number,
    currentWord: VocabItem
  ): Promise<{ success: boolean; error?: string }> => {
    const wasMemorized = memorizedWords.has(wordId)
    const willBeMemorized = !wasMemorized

    // Update local state first
    const newSet = new Set(memorizedWords)
    if (newSet.has(wordId)) {
      newSet.delete(wordId)
    } else {
      newSet.add(wordId)
    }
    setMemorizedWords(newSet)

    try {
      // Call API to update memorized status
      const result = await vocabularyService.toggleMemorizedStatus(
        currentWord,
        willBeMemorized
      )

      if (!result.success) {
        // Revert local state if API call failed
        setMemorizedWords(memorizedWords)
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      // Revert local state on error
      setMemorizedWords(memorizedWords)
      console.error('Error updating memorized status:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  const resetAllMemorizedWords = () => {
    resetMemorizedWords()
  }

  const resetMemorizedWordsByDay = (day: number) => {
    // Get all word IDs for the specified day
    const wordsInDay = vocabularyData
      .filter(word => word.day === day)
      .map(word => word.id)

    // Create a new set excluding words from the specified day
    const newMemorizedSet = new Set(memorizedWords)
    wordsInDay.forEach(wordId => {
      newMemorizedSet.delete(wordId)
    })

    setMemorizedWords(newMemorizedSet)
  }

  const getMemorizedWordCountByDay = (day: number): number => {
    const wordsInDay = vocabularyData
      .filter(word => word.day === day)
      .map(word => word.id)

    return wordsInDay.filter(wordId => memorizedWords.has(wordId)).length
  }

  return {
    memorizedWords,
    toggleMemorized,
    resetAllMemorizedWords,
    resetMemorizedWordsByDay,
    getMemorizedWordCountByDay,
  }
}
