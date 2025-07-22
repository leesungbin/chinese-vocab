import { useMemorizedWordsStorage } from './useLocalStorage'
import { vocabularyService, type VocabItem } from '@/utils/vocabularyService'

export function useMemorizedWords() {
  const { memorizedWords, setMemorizedWords, resetMemorizedWords } = useMemorizedWordsStorage()

  const toggleMemorized = async (wordId: number, currentWord: VocabItem): Promise<{ success: boolean; error?: string }> => {
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
      const result = await vocabularyService.toggleMemorizedStatus(currentWord, willBeMemorized)
      
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

  return {
    memorizedWords,
    toggleMemorized,
    resetAllMemorizedWords
  }
}