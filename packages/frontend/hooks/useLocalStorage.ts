import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) {
        setValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
  }, [key])

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  return [value, setStoredValue] as const
}

export function useMemorizedWordsStorage() {
  const [memorizedWords, setMemorizedWords] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const savedMemorized = localStorage.getItem('memorizedWords')
      if (savedMemorized) {
        const memorizedArray = JSON.parse(savedMemorized)
        setMemorizedWords(new Set(memorizedArray))
      }
    } catch (error) {
      console.error('Error loading memorized words from localStorage:', error)
    }
  }, [])

  const saveMemorizedWords = (memorizedSet: Set<number>) => {
    try {
      localStorage.setItem('memorizedWords', JSON.stringify(Array.from(memorizedSet)))
      setMemorizedWords(memorizedSet)
    } catch (error) {
      console.error('Error saving memorized words to localStorage:', error)
    }
  }

  const resetMemorizedWords = () => {
    try {
      localStorage.removeItem('memorizedWords')
      setMemorizedWords(new Set())
    } catch (error) {
      console.error('Error resetting memorized words:', error)
    }
  }

  return {
    memorizedWords,
    setMemorizedWords: saveMemorizedWords,
    resetMemorizedWords
  }
}