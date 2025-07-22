import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GoogleSheetsService } from '../services/googleSheets';
import { ApiResponse } from '../types';

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
    const sheetsService = new GoogleSheetsService();
    
    // Get query parameters
    const range = event.queryStringParameters?.range || 'Sheet1!A:H';
    const filter = event.queryStringParameters?.filter; // 'memorized', 'unmemorized', or undefined for all
    
    let words = await sheetsService.getVocabWords(range);
    
    // Apply filter if specified
    if (filter === 'memorized') {
      words = words.filter(word => word.memorized);
    } else if (filter === 'unmemorized') {
      words = words.filter(word => !word.memorized);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        words,
        count: words.length,
        filter: filter || 'all',
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    
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