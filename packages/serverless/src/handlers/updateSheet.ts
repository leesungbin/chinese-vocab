import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GoogleSheetsService } from '../services/googleSheets';
import { UpdateRequest, ApiResponse } from '../types';
import { validateAuthorizedUser, AuthError } from '../middleware/auth';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Get origin from request headers for CORS (handle undefined headers)
  const origin = event.headers?.origin || event.headers?.Origin || 'http://localhost:3000';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://leesungbin.github.io',
    'https://vocab.sungbin.dev'
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
    // Validate JWT token and check authorization for all write operations
    const user = validateAuthorizedUser(event);
    console.log(`Authorized user: ${user.email} (${user.name})`);
    
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const request: UpdateRequest = JSON.parse(event.body);
    const sheetsService = new GoogleSheetsService();

    let result;
    
    switch (request.action) {
      case 'add':
        await sheetsService.addVocabWord(request.word);
        result = { message: 'Word added successfully' };
        break;
        
      case 'update':
        // For update, we need to find the word first
        const words = await sheetsService.getVocabWords();
        const wordIndex = words.findIndex(w => w.chinese === request.word.chinese);
        if (wordIndex === -1) {
          throw new Error('Word not found');
        }
        await sheetsService.updateVocabWord(request.word, wordIndex);
        result = { message: 'Word updated successfully' };
        break;
        
      case 'mark_memorized':
        await sheetsService.markAsMemorized(request.word.chinese);
        result = { message: 'Word marked as memorized' };
        break;
        
      case 'increment_total':
        await sheetsService.incrementTotalAndUpdateLastReviewed(request.word.chinese);
        result = { message: 'Total count incremented' };
        break;
        
      case 'delete':
        await sheetsService.deleteVocabWord(request.word.chinese);
        result = { message: 'Word deleted successfully' };
        break;
        
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