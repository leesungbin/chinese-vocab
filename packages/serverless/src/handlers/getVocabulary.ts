import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { GoogleSheetsService } from '../services/googleSheets';
import { ApiResponse } from '../types';
import { validateAuthorizedUser, AuthError, validateJWT } from '../middleware/auth';

const ANONYMOUS_SPREADSHEET_ID = '1JBGAlJ14-yKHoSNlVnogCT4Xj30SLS_jQNuZe5YLe0I';
const ANONYMOUS_USER_ID = 'anonymous';

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
    const dynamoService = new DynamoService();
    let userId = ANONYMOUS_USER_ID;
    let isAuthenticated = false;
    
    try {
      // Try to validate user - if it fails, treat as anonymous
      const user = validateJWT(event);
      userId = user.userId;
      isAuthenticated = true;
      console.log(`Fetching vocabulary for authenticated user: ${user.email} (${user.name})`);
    } catch (authError) {
      console.log('No valid authentication found, using anonymous user data');
    }
    
    // Get query parameters
    const filter = event.queryStringParameters?.filter as 'memorized' | 'unmemorized' | undefined;
    
    // Get user's vocabulary from DynamoDB
    let words = await dynamoService.getUserVocabulary(userId, filter);
    
    // If anonymous user and no cached data, fetch from Google Sheets
    if (userId === ANONYMOUS_USER_ID && words.length === 0) {
      console.log('No cached anonymous data found, fetching from Google Sheets...');
      
      try {
        const sheetsService = new GoogleSheetsService(ANONYMOUS_SPREADSHEET_ID);
        const sheetData = await sheetsService.getVocabularyData();
        
        if (sheetData.length > 0) {
          // Save the data to DynamoDB for future requests
          await dynamoService.saveUserVocabulary(ANONYMOUS_USER_ID, sheetData);
          words = sheetData;
          console.log(`Cached ${sheetData.length} words for anonymous users`);
        }
      } catch (sheetsError) {
        console.error('Error fetching from Google Sheets:', sheetsError);
        // Continue with empty array if sheets fetch fails
      }
    }
    
    // Sort by id to maintain consistent order
    words = words.sort((a, b) => a.id - b.id);

    const response: ApiResponse = {
      success: true,
      data: {
        words,
        count: words.length,
        filter: filter || 'all',
        userId: userId,
        isAuthenticated,
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    
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