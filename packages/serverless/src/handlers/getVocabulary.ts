import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoService } from '../services/dynamoService'
import { ApiResponse } from '../types'
import { validateJWT } from '../middleware/auth'
import { allowedOrigins } from '../constants'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Get origin from request headers for CORS (handle undefined headers)
  const origin =
    event.headers?.origin || event.headers?.Origin || 'http://localhost:3000'
  const corsOrigin = allowedOrigins.includes(origin)
    ? origin
    : 'http://localhost:3000'

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Content-Type, Cache-Control, Pragma, Expires, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    const dynamoService = new DynamoService()

    // Require authentication - throw error for anonymous users
    const user = validateJWT(event)
    const userId = user.userId
    console.log(
      `Fetching vocabulary for authenticated user: ${user.email} (${user.name})`
    )

    // Get query parameters
    const filter = event.queryStringParameters?.filter as
      | 'memorized'
      | 'unmemorized'
      | undefined

    // Get user's vocabulary from DynamoDB
    let words = await dynamoService.getUserVocabulary(userId, filter)

    // Sort by id to maintain consistent order
    words = words.sort((a, b) => a.id - b.id)

    const response: ApiResponse = {
      success: true,
      data: {
        words,
        count: words.length,
        filter: filter || 'all',
        userId: userId,
      },
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error fetching vocabulary:', error)

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(response),
    }
  }
}
