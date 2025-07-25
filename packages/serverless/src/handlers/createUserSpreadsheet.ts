import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoService } from '../services/dynamoService'
import { validateJWT, AuthError } from '../middleware/auth'
import { GoogleSheetsOAuthService } from '../services/googleSheetsOAuth'

const ANONYMOUS_SPREADSHEET_ID = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I'
const SERVICE_ACCOUNT_EMAIL = 'chinese-vocab@chinese-vocab-466512.iam.gserviceaccount.com'

const dynamoService = new DynamoService()

export async function createUserSpreadsheet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OAuth-Token',
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
    // Validate JWT token and get user info
    const user = validateJWT(event)
    console.log(`Creating spreadsheet for user: ${user.email} (${user.name})`)

    // Get OAuth token from header
    const oauthToken = event.headers['X-OAuth-Token'] || event.headers['x-oauth-token']
    if (!oauthToken) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false,
          error: 'Missing OAuth token for Google Sheets access. Please re-authorize.',
          requiresReauth: true
        }),
      }
    }

    // Check if user already has a spreadsheet
    const existingSpreadsheetId = await dynamoService.getUserSpreadsheetId(user.userId)
    if (existingSpreadsheetId) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          spreadsheetId: existingSpreadsheetId,
          message: 'User already has a spreadsheet',
          isNew: false,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${existingSpreadsheetId}/edit`
        }),
      }
    }

    // Create Google Sheets service with user's OAuth token
    const sheetsService = new GoogleSheetsOAuthService(oauthToken)

    // Create spreadsheet title
    const spreadsheetTitle = `Chinese Vocabulary - ${user.name}`

    // Create the spreadsheet using OAuth
    console.log('Creating new spreadsheet with OAuth...')
    const { spreadsheetId, spreadsheetUrl } = await sheetsService.createSpreadsheet(spreadsheetTitle)
    console.log(`Created new spreadsheet: ${spreadsheetId}`)

    // Store the spreadsheet ID in DynamoDB
    await dynamoService.setUserSpreadsheetId(user.userId, spreadsheetId)
    console.log(`Stored spreadsheet ID for user ${user.userId}`)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        spreadsheetId: spreadsheetId,
        message: 'Successfully created personal Google Sheet',
        isNew: true,
        sheetUrl: spreadsheetUrl
      }),
    }

  } catch (error) {
    console.error('Error creating user spreadsheet:', error)
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return {
        statusCode: error.statusCode,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: error.message,
        }),
      }
    }

    // Handle specific OAuth errors
    if (error instanceof Error && error.message.includes('insufficient authentication scopes')) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false,
          error: 'Insufficient permissions. Please re-authorize with Google Sheets access.',
          requiresReauth: true
        }),
      }
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create spreadsheet' 
      }),
    }
  }
}