import { API_BASE_URL } from '@/config/api'

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

const getApiHeaders = (includeOAuth: boolean = false) => {
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

  // Add OAuth token header if requested and available
  if (includeOAuth) {
    const oauthToken = localStorage.getItem('oauth-token')
    if (oauthToken) {
      headers['X-OAuth-Token'] = oauthToken
    }
  }

  return headers
}

const getApiOptions = (method: string = 'GET', body?: object, includeOAuth: boolean = false) => ({
  method,
  cache: 'no-cache' as RequestCache,
  headers: getApiHeaders(includeOAuth),
  ...(body && { body: JSON.stringify(body) }),
})

export const vocabularyService = {
  // Fetch all vocabulary data from the API
  async fetchVocabularyData(): Promise<VocabItem[]> {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth-token')
      
      let response: Response
      if (!token) {
        // For anonymous users, use the anonymous vocabulary endpoint
        console.log('No authentication token found - loading anonymous vocabulary')
        response = await fetch(`${API_BASE_URL}/get-anonymous-vocabulary`, {
          method: 'GET',
          cache: 'no-cache' as RequestCache,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
      } else {
        // For authenticated users, use the regular endpoint
        response = await fetch(`${API_BASE_URL}/get-vocabulary`, getApiOptions())
      }
      
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

  // Get user's current spreadsheet ID
  async getUserSpreadsheetId(): Promise<{ success: boolean; spreadsheetId?: string; error?: string }> {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(`${API_BASE_URL}/get-user-spreadsheet`, getApiOptions())
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { success: false, error: 'Authentication failed' }
        }
        throw new Error('Failed to fetch user spreadsheet ID')
      }

      const result = await response.json()
      return { 
        success: result.success, 
        spreadsheetId: result.spreadsheetId,
        error: result.error 
      }
    } catch (error) {
      console.error('Error fetching user spreadsheet ID:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch spreadsheet ID' 
      }
    }
  },

  // Create a new Google Sheet for the user
  async createUserSpreadsheet(): Promise<{ success: boolean; spreadsheetId?: string; error?: string; isNew?: boolean; sheetUrl?: string; requiresReauth?: boolean }> {
    try {
      const token = localStorage.getItem('auth-token')
      const oauthToken = localStorage.getItem('oauth-token')
      
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      if (!oauthToken) {
        return { 
          success: false, 
          error: 'Google Sheets permission required. Please sign in again.',
          requiresReauth: true
        }
      }

      const response = await fetch(`${API_BASE_URL}/create-user-spreadsheet`, getApiOptions('POST', {}, true))

      const result = await response.json()
      
      if (!response.ok) {
        if (result.requiresReauth) {
          return { 
            success: false, 
            error: result.error || 'Re-authorization required',
            requiresReauth: true
          }
        }
        return { 
          success: false, 
          error: result.error || `HTTP ${response.status}: ${response.statusText}` 
        }
      }

      return { 
        success: result.success, 
        spreadsheetId: result.spreadsheetId,
        error: result.error,
        isNew: result.isNew,
        sheetUrl: result.sheetUrl
      }
    } catch (error) {
      console.error('Error creating user spreadsheet:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create spreadsheet' 
      }
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