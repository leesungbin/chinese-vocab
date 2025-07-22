interface VocabItem {
  chinese: string
  pinyin: string
  korean: string
  id: number
  total?: number
  day?: number
  memorized?: boolean
}

interface VocabWord {
  id: number
  day: number
  chinese: string
  pinyin: string
  korean: string
  memorized: boolean
  lastReviewed?: string
  total?: number
}

interface ApiResponse {
  success: boolean
  data?: {
    words: VocabWord[]
    count: number
    filter: string
  }
  error?: string
}

const API_BASE_URL = 'https://ppwyq3yin2.execute-api.ap-northeast-2.amazonaws.com/dev'

const getApiHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  // Add Authorization header if token exists in localStorage
  const token = localStorage.getItem('auth-token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

const getApiOptions = (method: string = 'GET', body?: object) => ({
  method,
  cache: 'no-cache' as RequestCache,
  headers: getApiHeaders(),
  ...(body && { body: JSON.stringify(body) }),
})

export const vocabularyService = {
  // Fetch all vocabulary data from the API
  async fetchVocabularyData(): Promise<VocabItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/get-sheet`, getApiOptions())
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from API')
      }

      const result: ApiResponse = await response.json()
      
      // Check if the API returned success and extract the words
      if (result.success && result.data && result.data.words) {
        return result.data.words.map((item: VocabWord, index: number) => ({
          id: item.id || index + 1,
          chinese: item.chinese || '',
          pinyin: item.pinyin || '',
          korean: item.korean || '',
          total: item.total || 0,
          day: item.day || 0,
          memorized: item.memorized || false
        }))
      } else {
        throw new Error(result.error || 'API returned unsuccessful response')
      }
    } catch (error) {
      console.error('Error fetching vocabulary data:', error)
      return []
    }
  },

  // Increment the total count for a word (when viewed)
  async incrementWordTotal(chinese: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/update-sheet`, getApiOptions('POST', {
        action: 'increment_total',
        word: { chinese }
      }))

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Error incrementing word total:', error)
      return false
    }
  },

  // Mark a word as memorized
  async markWordAsMemorized(word: VocabItem): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/update-sheet`, getApiOptions('POST', {
        action: 'mark_memorized',
        word: {
          id: word.id,
          day: word.day,
          chinese: word.chinese,
          pinyin: word.pinyin,
          korean: word.korean,
          memorized: true,
          total: word.total,
          lastReviewed: new Date().toISOString()
        }
      }))

      const result = await response.json()
      
      if (!result.success && response.status === 403) {
        return { success: false, error: result.error || 'You are not authorized to perform this action' }
      }
      
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Error marking word as memorized:', error)
      return { success: false, error: 'Network error occurred' }
    }
  },

  // Update a word (for unmarking memorized or other updates)
  async updateWord(word: VocabItem): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/update-sheet`, getApiOptions('POST', {
        action: 'update',
        word: {
          id: word.id,
          day: word.day,
          chinese: word.chinese,
          pinyin: word.pinyin,
          korean: word.korean,
          memorized: word.memorized || false,
          total: word.total,
          lastReviewed: new Date().toISOString()
        }
      }))

      const result = await response.json()
      
      if (!result.success && response.status === 403) {
        return { success: false, error: result.error || 'You are not authorized to perform this action' }
      }
      
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Error updating word:', error)
      return { success: false, error: 'Network error occurred' }
    }
  },

  // Toggle memorized status for a word
  async toggleMemorizedStatus(word: VocabItem, willBeMemorized: boolean): Promise<{ success: boolean; error?: string }> {
    if (willBeMemorized) {
      return await this.markWordAsMemorized(word)
    } else {
      return await this.updateWord({ ...word, memorized: false })
    }
  }
}

export type { VocabItem, VocabWord, ApiResponse }