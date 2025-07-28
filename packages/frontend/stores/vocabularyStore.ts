import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import { vocabularyService, type VocabItem } from '@/utils/vocabularyService'

interface VocabularyState {
  // Data state
  originalData: VocabItem[]
  vocabularyData: VocabItem[]
  isLoading: boolean
  error: string | null

  // User state tracking
  currentUserId: string | null

  // Filter and shuffle state
  isShuffled: boolean
  selectedDay: number | null
  availableDays: number[]

  // Actions
  loadVocabularyData: (forceReload?: boolean) => Promise<void>
  checkAndReloadForUser: (userId: string | null) => Promise<void>
  shuffleWords: () => void
  filterByDay: (day: number | null) => void
  resetToOriginal: () => void
  updateWordTotal: (wordId: number) => void

  // Computed selectors
  getFilteredData: (
    memorizedWords: Set<number>,
    showMemorizedWords: boolean
  ) => VocabItem[]
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  // Initial state
  originalData: [],
  vocabularyData: [],
  isLoading: false,
  error: null,
  currentUserId: null,
  isShuffled: false,
  selectedDay: null,
  availableDays: [],

  // Load vocabulary data from API
  loadVocabularyData: async (forceReload = false) => {
    const { isLoading } = get()

    // Prevent multiple simultaneous loads unless forced
    if (isLoading && !forceReload) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const data = await vocabularyService.fetchVocabularyData()

      // Determine current user ID (authenticated user ID or 'anonymous')
      const token = localStorage.getItem('auth-token')
      const currentUserId = token
        ? JSON.parse(localStorage.getItem('user') || '{}').id || 'authenticated'
        : 'anonymous'

      if (data.length > 0) {
        // Extract unique days from the data
        const days = [
          ...new Set(data.map(item => item.day).filter(day => day && day > 0)),
        ]
          .filter(e => typeof e === 'number')
          .sort((a, b) => a - b)

        set({
          originalData: data,
          vocabularyData: data,
          availableDays: days,
          currentUserId,
          isLoading: false,
          error: null,
        })
      } else {
        set({
          currentUserId,
          isLoading: false,
          error: 'No vocabulary data found',
        })
      }
    } catch (error) {
      console.error('Failed to load vocabulary data:', error)
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load vocabulary data',
      })
    }
  },

  // Check if user has changed and reload vocabulary if needed
  checkAndReloadForUser: async (userId: string | null) => {
    const { currentUserId, isLoading } = get()
    const effectiveUserId = userId || 'anonymous'

    // Only reload if the user has actually changed and we have a previous user ID
    // Also don't trigger if already loading
    if (
      currentUserId !== null &&
      currentUserId !== effectiveUserId &&
      !isLoading
    ) {
      await get().loadVocabularyData(true)
    }
  },

  // Shuffle current vocabulary data
  shuffleWords: () => {
    const { vocabularyData } = get()
    if (vocabularyData.length === 0) return

    const shuffled = [...vocabularyData].sort(() => Math.random() - 0.5)
    set({
      vocabularyData: shuffled,
      isShuffled: true,
    })
  },

  // Filter vocabulary by day
  filterByDay: (day: number | null) => {
    const { originalData, isShuffled } = get()

    set({ selectedDay: day })

    if (day === null) {
      // Show all words
      const data = isShuffled
        ? [...originalData].sort(() => Math.random() - 0.5)
        : originalData
      set({ vocabularyData: data })
    } else {
      // Filter by specific day
      const filtered = originalData.filter(item => item.day === day)
      const data = isShuffled
        ? [...filtered].sort(() => Math.random() - 0.5)
        : filtered
      set({ vocabularyData: data })
    }
  },

  // Reset to original unshuffled, unfiltered data
  resetToOriginal: () => {
    const { originalData } = get()
    set({
      vocabularyData: originalData,
      isShuffled: false,
      selectedDay: null,
    })
  },

  // Update word total count
  updateWordTotal: (wordId: number) => {
    const { vocabularyData } = get()
    const updatedData = vocabularyData.map(item =>
      item.id === wordId ? { ...item, total: (item.total || 0) + 1 } : item
    )
    set({ vocabularyData: updatedData })
  },

  // Get filtered data based on memorized words preference
  getFilteredData: (
    memorizedWords: Set<number>,
    showMemorizedWords: boolean
  ) => {
    const { vocabularyData } = get()

    if (showMemorizedWords) {
      return vocabularyData
    }
    return vocabularyData.filter(word => !memorizedWords.has(word.id))
  },
}))

// Selectors for specific parts of the state (performance optimization)
export const useVocabularyData = () =>
  useVocabularyStore(state => state.vocabularyData)
export const useOriginalData = () =>
  useVocabularyStore(state => state.originalData)
export const useVocabularyLoading = () =>
  useVocabularyStore(state => state.isLoading)
export const useVocabularyError = () => useVocabularyStore(state => state.error)
export const useVocabularyShuffled = () =>
  useVocabularyStore(state => state.isShuffled)
export const useSelectedDay = () =>
  useVocabularyStore(state => state.selectedDay)
export const useAvailableDays = () =>
  useVocabularyStore(state => state.availableDays)

// Individual action selectors - avoids object creation
export const useLoadVocabularyData = () =>
  useVocabularyStore(state => state.loadVocabularyData)
export const useCheckAndReloadForUser = () =>
  useVocabularyStore(state => state.checkAndReloadForUser)
export const useShuffleWords = () =>
  useVocabularyStore(state => state.shuffleWords)
export const useFilterByDay = () =>
  useVocabularyStore(state => state.filterByDay)
export const useResetToOriginal = () =>
  useVocabularyStore(state => state.resetToOriginal)
export const useUpdateWordTotal = () =>
  useVocabularyStore(state => state.updateWordTotal)
export const useGetFilteredData = () =>
  useVocabularyStore(state => state.getFilteredData)
