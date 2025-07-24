import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { ApiResponse } from '../types';
import { validateAuthorizedUser, AuthError } from '../middleware/auth';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Get origin from request headers for CORS (handle undefined headers)
  const origin = event.headers?.origin || event.headers?.Origin || 'http://localhost:3000';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://leesungbin.github.io'
  ];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'http://localhost:3000';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Expires, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Validate JWT token and get user info
    const user = validateAuthorizedUser(event);
    console.log(`Fetching vocabulary for user: ${user.email} (${user.name})`);
    
    const dynamoService = new DynamoService();
    
    // Get query parameters
    const filter = event.queryStringParameters?.filter as 'memorized' | 'unmemorized' | undefined;
    
    // Get user's vocabulary from DynamoDB
    let words = await dynamoService.getUserVocabulary(user.userId, filter);
    
    // Sort by id to maintain consistent order
    words = words.sort((a, b) => a.id - b.id);

    const response: ApiResponse = {
      success: true,
      data: {
        words,
        count: words.length,
        filter: filter || 'all',
        userId: user.userId,
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };

      return {
        statusCode: error.statusCode,
        headers,
        body: JSON.stringify(response),
      };
    }
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(response),
    };
  }
};