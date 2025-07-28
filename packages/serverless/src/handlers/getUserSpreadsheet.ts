import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import jwt from 'jsonwebtoken'
import { DynamoService } from '../services/dynamoService'

const dynamoService = new DynamoService()

export async function getUserSpreadsheet(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    // Get and verify the JWT token
    const authHeader =
      event.headers['Authorization'] || event.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing or invalid authorization header',
        }),
      }
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    let userInfo: any
    try {
      userInfo = jwt.verify(token, jwtSecret)
    } catch (error) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      }
    }

    const userId = userInfo.userId
    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid token: missing user ID' }),
      }
    }

    // Get user's spreadsheet ID from DynamoDB
    const spreadsheetId = await dynamoService.getUserSpreadsheetId(userId)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        spreadsheetId: spreadsheetId,
      }),
    }
  } catch (error) {
    console.error('Error getting user spreadsheet:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    }
  }
}
