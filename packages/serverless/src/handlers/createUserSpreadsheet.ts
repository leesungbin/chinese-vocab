import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { google } from 'googleapis'
import { DynamoService } from '../services/dynamoService'
import { validateJWT, AuthError } from '../middleware/auth'

const ANONYMOUS_SPREADSHEET_ID = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I'
const SERVICE_ACCOUNT_EMAIL = 'chinese-vocab@chinese-vocab-466512.iam.gserviceaccount.com'

const dynamoService = new DynamoService()

export async function createUserSpreadsheet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
          isNew: false
        }),
      }
    }

    // Initialize Google APIs
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}')
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const drive = google.drive({ version: 'v3', auth })

    // Step 1: Copy the anonymous template spreadsheet
    console.log('Copying template spreadsheet...')
    const copyResponse = await drive.files.copy({
      fileId: ANONYMOUS_SPREADSHEET_ID,
      requestBody: {
        name: `Chinese Vocabulary - ${user.name}`,
        description: `Personal Chinese vocabulary sheet for ${user.email}`
      }
    })

    const newSpreadsheetId = copyResponse.data.id!
    console.log(`Created new spreadsheet: ${newSpreadsheetId}`)

    // Step 2: Add editor permissions for the user
    console.log(`Adding editor permission for user: ${user.email}`)
    await drive.permissions.create({
      fileId: newSpreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: user.email
      },
      sendNotificationEmail: true,
      emailMessage: `Your personal Chinese vocabulary spreadsheet has been created! You can now edit and manage your vocabulary directly in Google Sheets.`
    })

    // Step 3: Add editor permissions for the service account
    console.log(`Adding editor permission for service account: ${SERVICE_ACCOUNT_EMAIL}`)
    await drive.permissions.create({
      fileId: newSpreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: SERVICE_ACCOUNT_EMAIL
      },
      sendNotificationEmail: false
    })

    // Step 4: Store the spreadsheet ID in DynamoDB
    await dynamoService.setUserSpreadsheetId(user.userId, newSpreadsheetId)
    console.log(`Stored spreadsheet ID for user ${user.userId}`)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        spreadsheetId: newSpreadsheetId,
        message: 'Successfully created personal Google Sheet',
        isNew: true,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`
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