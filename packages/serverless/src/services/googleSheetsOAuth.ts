import { google } from 'googleapis'

export class GoogleSheetsOAuthService {
  private sheets: any
  private drive: any

  constructor(accessToken: string) {
    // Create OAuth2 client with user's access token
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    this.sheets = google.sheets({ version: 'v4', auth: oauth2Client })
    this.drive = google.drive({ version: 'v3', auth: oauth2Client })
  }

  async createSpreadsheet(title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    try {
      // Create the spreadsheet
      const createResponse = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: title,
          },
          sheets: [
            {
              properties: {
                title: 'Vocabulary',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10,
                },
              },
            },
          ],
        },
      })

      const spreadsheetId = createResponse.data.spreadsheetId
      const spreadsheetUrl = createResponse.data.spreadsheetUrl

      // Get the actual sheet ID from the creation response
      const firstSheet = createResponse.data.sheets?.[0]
      const sheetId = firstSheet?.properties?.sheetId

      if (!sheetId && sheetId !== 0) {
        throw new Error('Failed to get sheet ID from created spreadsheet')
      }

      // Add headers and default vocabulary rows to the sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Vocabulary!A1:E5',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [
            ['id', 'day', 'chinese', 'pinyin', 'korean'],
            ['=ROW()-1', 1, '丈夫', 'zhàngfu', '남편'],
            ['=ROW()-1', 1, '阿姨', 'āyí', '이모 / 아주머니'],
            ['=ROW()-1', 2, '叔叔', 'shūshu', '삼촌 / 아저씨'],
            ['=ROW()-1', 2, '邻居', 'línjū', '이웃']
          ],
        },
      })

      // Format the header row using the correct sheet ID
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 5,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9,
                    },
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
          ],
        },
      })

      return {
        spreadsheetId: spreadsheetId!,
        spreadsheetUrl: spreadsheetUrl!,
      }
    } catch (error) {
      console.error('Error creating spreadsheet with OAuth:', error)
      throw new Error('Failed to create spreadsheet')
    }
  }

  async addVocabularyEntries(spreadsheetId: string, entries: any[]): Promise<void> {
    try {
      // Get the current number of rows with data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Vocabulary!A:A',
      })

      const existingRows = response.data.values ? response.data.values.length : 1
      const startRow = existingRows + 1

      // Prepare the values to insert
      const values = entries.map(entry => [
        entry.chinese,
        entry.pinyin,
        entry.english,
        entry.level || '',
        new Date().toISOString().split('T')[0], // Date added
        'New' // Study status
      ])

      // Add the new entries
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Vocabulary!A${startRow}:F${startRow + values.length - 1}`,
        valueInputOption: 'RAW',
        resource: {
          values,
        },
      })
    } catch (error) {
      console.error('Error adding vocabulary entries with OAuth:', error)
      throw new Error('Failed to add vocabulary entries')
    }
  }
}