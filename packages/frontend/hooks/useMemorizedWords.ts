import { useMemorizedWordsStorage } from './useLocalStorage'
import { vocabularyService, type VocabItem } from '@/utils/vocabularyService'

export function useMemorizedWords() {
  const { memorizedWords, setMemorizedWords, resetMemorizedWords } = useMemorizedWordsStorage()

  const toggleMemorized = (wordId: number, currentWord: VocabItem) => {
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

    // Call API to update memorized status (asynchronously)
    vocabularyService.toggleMemorizedStatus(currentWord, willBeMemorized).catch(error => {
      console.error('Error updating memorized status:', error)
    })
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