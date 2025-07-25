import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { UpdateRequest, ApiResponse } from '../types';
import { validateAuthorizedUser, AuthError } from '../middleware/auth';
import { allowedOrigins } from '../constants';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Get origin from request headers for CORS (handle undefined headers)
  const origin = event.headers?.origin || event.headers?.Origin || 'http://localhost:3000';
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
    // Validate JWT token and check authorization for all write operations
    const user = validateAuthorizedUser(event);
    console.log(`Authorized user: ${user.email} (${user.name})`);
    
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const request: UpdateRequest = JSON.parse(event.body);
    const dynamoService = new DynamoService();

    let result;
    
    switch (request.action) {
      case 'mark_memorized':
        await dynamoService.markAsMemorized(user.userId, request.word.id);
        result = { message: 'Word marked as memorized' };
        break;
        
      case 'unmark_memorized':
        await dynamoService.unmarkAsMemorized(user.userId, request.word.id);
        result = { message: 'Word unmarked as memorized' };
        break;
        
      case 'increment_total':
        await dynamoService.incrementTotalAndUpdateLastReviewed(user.userId, request.word.id);
        result = { message: 'Total count incremented' };
        break;
        
      // Note: add, update, delete operations are not supported for user progress data
      // Static vocabulary data (chinese, pinyin, korean) should only be managed via migration
      case 'add':
      case 'update':
      case 'delete':
        throw new Error(`Action '${request.action}' is not supported. Static vocabulary data can only be managed via migration.`);
        
      default:
        throw new Error('Invalid action');
    }

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
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