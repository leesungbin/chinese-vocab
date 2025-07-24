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
  // Fetch all vocabulary data from the API (now requires authentication)
  async fetchVocabularyData(): Promise<VocabItem[]> {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth-token')
      if (!token) {
        console.warn('No authentication token found - user needs to sign in')
        return []
      }

      const response = await fetch(`${API_BASE_URL}/get-vocabulary`, getApiOptions())
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Authentication failed - user needs to sign in again')
          return []
        }
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
  async incrementWordTotal(wordId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/update-vocabulary`, getApiOptions('POST', {
        action: 'increment_total',
        word: { id: wordId }
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
      const response = await fetch(`${API_BASE_URL}/update-vocabulary`, getApiOptions('POST', {
        action: 'mark_memorized',
        word: { id: word.id }
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
      const response = await fetch(`${API_BASE_URL}/update-vocabulary`, getApiOptions('POST', {
        action: 'unmark_memorized',
        word: { id: word.id }
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
      const response = await fetch(`${API_BASE_URL}/update-vocabulary`, getApiOptions('POST', {
        action: 'unmark_memorized',
        word: { id: word.id }
      }))

      const result = await response.json()
      
      if (!result.success && response.status === 403) {
        return { success: false, error: result.error || 'You are not authorized to perform this action' }
      }
      
      return { success: result.success, error: result.error }
    }
  },

  // Migrate data from Google Sheets to DynamoDB
  async migrateDataFromSheets(spreadsheetId?: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(`${API_BASE_URL}/migrate-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          ...(spreadsheetId && { spreadsheetId })
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        return { 
          success: false, 
          error: result.error || `HTTP ${response.status}: ${response.statusText}` 
        }
      }

      return { 
        success: result.success, 
        error: result.error,
        data: result.data 
      }
    } catch (error) {
      console.error('Error migrating data:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Migration failed' 
      }
    }
  }
}

export type { VocabItem, VocabWord, ApiResponse }