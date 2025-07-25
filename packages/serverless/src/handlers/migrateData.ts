import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GoogleSheetsService } from '../services/googleSheets';
import { DynamoService } from '../services/dynamoService';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

interface MigrationRequest {
  spreadsheetId?: string;
  token: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    if (!event.body) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing request body',
      };
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(response),
      };
    }

    const { spreadsheetId, token }: MigrationRequest = JSON.parse(event.body);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing authentication token',
      };
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify(response),
      };
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    let userInfo: JWTPayload;
    try {
      userInfo = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token',
      };
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify(response),
      };
    }

    // Initialize services
    const sheetsService = new GoogleSheetsService(spreadsheetId);
    const dynamoService = new DynamoService();

    // Get vocabulary data from Google Sheets
    const range = 'Sheet1!A:H';
    const vocabularyWords = await sheetsService.getVocabWords(range);

    if (vocabularyWords.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No vocabulary words found in the spreadsheet',
      };
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(response),
      };
    }

    // Delete existing vocabulary for this user
    await dynamoService.deleteUserVocabulary(userInfo.userId);

    // Migrate data to DynamoDB
    await dynamoService.batchAddVocabWords(userInfo.userId, vocabularyWords);

    // Save the user's spreadsheet ID for future reference
    await dynamoService.setUserSpreadsheetId(userInfo.userId, spreadsheetId);

    const response: ApiResponse = {
      success: true,
      data: {
        message: `Successfully migrated ${vocabularyWords.length} vocabulary words`,
        wordCount: vocabularyWords.length,
        userId: userInfo.userId,
        spreadsheetId: spreadsheetId,
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Migration error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(response),
    };
  }
};