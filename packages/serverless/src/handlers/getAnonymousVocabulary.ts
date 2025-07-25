import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { GoogleSheetsService } from '../services/googleSheets'
import { DynamoService } from '../services/dynamoService'

const ANONYMOUS_SPREADSHEET_ID = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I'
const ANONYMOUS_USER_ID = 'anonymous'

const dynamoService = new DynamoService()

export async function getAnonymousVocabulary(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  try {
    // First try to get cached anonymous data from DynamoDB
    let vocabularyWords = await dynamoService.getUserVocabulary(ANONYMOUS_USER_ID)
    
    // If no cached data exists, fetch from Google Sheets and cache it
    if (vocabularyWords.length === 0) {
      console.log('No cached anonymous data found, fetching from Google Sheets...')
      
      const sheetsService = new GoogleSheetsService(ANONYMOUS_SPREADSHEET_ID)
      const sheetData = await sheetsService.getVocabWords()
      
      if (sheetData.length > 0) {
        // Save the data to DynamoDB for future requests
        await dynamoService.batchAddVocabWords(ANONYMOUS_USER_ID, sheetData)
        vocabularyWords = sheetData
        console.log(`Cached ${sheetData.length} words for anonymous users`)
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          words: vocabularyWords,
          count: vocabularyWords.length,
          filter: 'all'
        }
      }),
    }
  } catch (error) {
    console.error('Error fetching anonymous vocabulary:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vocabulary data' 
      }),
    }
  }
}