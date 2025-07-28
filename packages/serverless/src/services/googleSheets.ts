import { google } from 'googleapis'
import { VocabWord, SheetData } from '../types'

export class GoogleSheetsService {
  private sheets
  private spreadsheetId: string

  constructor(customSpreadsheetId?: string) {
    const credentials = JSON.parse(
      process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'
    )
    this.spreadsheetId =
      customSpreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
  }

  async getVocabWords(range: string = 'Vocabulary!A2:E'): Promise<VocabWord[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      })

      const rows = response.data.values || []

      // New format: id, day, chinese, pinyin, korean (5 columns)
      return rows.map((row, index) => ({
        id: parseInt(row[0]) || index + 1,
        day: parseInt(row[1]) || 0,
        chinese: row[2] || '',
        pinyin: row[3] || '',
        korean: row[4] || '',
        memorized: false, // Default for new format
        lastReviewed: undefined,
        total: 0, // Default for new format
      }))
    } catch (error) {
      console.error('Error fetching vocab words:', error)
      throw new Error('Failed to fetch vocabulary words')
    }
  }

  async addVocabWord(
    word: VocabWord,
    range: string = 'Sheet1!A:H'
  ): Promise<void> {
    try {
      const values = [
        [
          word.id.toString(),
          word.day.toString(),
          word.chinese,
          word.pinyin,
          word.korean,
          word.memorized ? 'true' : 'false',
          word.lastReviewed || new Date().toISOString(),
          (word.total || 0).toString(),
        ],
      ]

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values },
      })
    } catch (error) {
      console.error('Error adding vocab word:', error)
      throw new Error('Failed to add vocabulary word')
    }
  }

  async updateVocabWord(
    word: VocabWord,
    rowIndex: number,
    range: string = 'Sheet1'
  ): Promise<void> {
    try {
      const updateRange = `${range}!A${rowIndex + 2}:H${rowIndex + 2}` // +2 for header and 1-indexed

      const values = [
        [
          word.id.toString(),
          word.day.toString(),
          word.chinese,
          word.pinyin,
          word.korean,
          word.memorized ? 'true' : 'false',
          word.lastReviewed || new Date().toISOString(),
          (word.total || 0).toString(),
        ],
      ]

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: { values },
      })
    } catch (error) {
      console.error('Error updating vocab word:', error)
      throw new Error('Failed to update vocabulary word')
    }
  }

  async markAsMemorized(
    chinese: string,
    range: string = 'Sheet1!A:H'
  ): Promise<void> {
    try {
      // First, get all words to find the correct row
      const words = await this.getVocabWords(range)
      const rowIndex = words.findIndex(word => word.chinese === chinese)

      if (rowIndex === -1) {
        throw new Error('Word not found')
      }

      const word = words[rowIndex]
      word.memorized = true
      word.lastReviewed = new Date().toISOString()

      await this.updateVocabWord(word, rowIndex, 'Sheet1')
    } catch (error) {
      console.error('Error marking word as memorized:', error)
      throw new Error('Failed to mark word as memorized')
    }
  }

  async incrementTotalAndUpdateLastReviewed(
    chinese: string,
    range: string = 'Sheet1!A:H'
  ): Promise<void> {
    try {
      // First, get all words to find the correct row
      const words = await this.getVocabWords(range)
      const rowIndex = words.findIndex(word => word.chinese === chinese)

      if (rowIndex === -1) {
        throw new Error('Word not found')
      }

      const word = words[rowIndex]
      word.total = (word.total || 0) + 1
      word.lastReviewed = new Date().toISOString()

      await this.updateVocabWord(word, rowIndex, 'Sheet1')
    } catch (error) {
      console.error('Error incrementing total count:', error)
      throw new Error('Failed to increment total count')
    }
  }

  async deleteVocabWord(
    chinese: string,
    range: string = 'Sheet1!A:H'
  ): Promise<void> {
    try {
      // First, get all words to find the correct row
      const words = await this.getVocabWords(range)
      const rowIndex = words.findIndex(word => word.chinese === chinese)

      if (rowIndex === -1) {
        throw new Error('Word not found')
      }

      // Delete the row (note: this requires additional permissions and is more complex)
      // For now, we'll mark it as deleted by clearing the contents
      const deleteRange = `Sheet1!A${rowIndex + 2}:H${rowIndex + 2}`

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: deleteRange,
      })
    } catch (error) {
      console.error('Error deleting vocab word:', error)
      throw new Error('Failed to delete vocabulary word')
    }
  }
}
