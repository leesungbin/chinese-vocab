import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { GoogleSheetsService } from '../services/googleSheets'
import { DynamoService } from '../services/dynamoService'

const ANONYMOUS_SPREADSHEET_ID = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I'
const ANONYMOUS_USER_ID = 'anonymous'

const dynamoService = new DynamoService()

export async function refreshAnonymousData(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    console.log('Refreshing anonymous vocabulary data...')
    
    // Clear existing anonymous data
    await dynamoService.clearUserVocabulary(ANONYMOUS_USER_ID)
    
    // Fetch fresh data from Google Sheets
    const sheetsService = new GoogleSheetsService(ANONYMOUS_SPREADSHEET_ID)
    const sheetData = await sheetsService.getVocabWords()
    
    if (sheetData.length > 0) {
      // Save the fresh data to DynamoDB
      await dynamoService.batchAddVocabWords(ANONYMOUS_USER_ID, sheetData)
      console.log(`Refreshed ${sheetData.length} words for anonymous users`)
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: `Successfully refreshed ${sheetData.length} vocabulary words for anonymous users`,
          count: sheetData.length
        }),
      }
    } else {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'No data found in the anonymous spreadsheet',
          count: 0
        }),
      }
    }
  } catch (error) {
    console.error('Error refreshing anonymous vocabulary:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh anonymous data' 
      }),
    }
  }
}