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

    // Always create a new spreadsheet (removed existing spreadsheet check)

    // Create Google Sheets service with user's OAuth token
    const sheetsService = new GoogleSheetsOAuthService(oauthToken)

    // Create spreadsheet title with timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().split('T')[0]
    const spreadsheetTitle = `Chinese Vocabulary - ${user.name} - ${timestamp}`

    // Create the spreadsheet using OAuth
    const { spreadsheetId, spreadsheetUrl } = await sheetsService.createSpreadsheet(spreadsheetTitle)

    // Update the user's spreadsheet ID in DynamoDB (overwrite existing if any)
    await dynamoService.setUserSpreadsheetId(user.userId, spreadsheetId)

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
    if (error instanceof Error && (
      error.message.includes('insufficient authentication scopes') ||
      error.message.includes('invalid_grant') ||
      error.message.includes('invalid_token')
    )) {
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