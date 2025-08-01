import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { VocabWord } from '../types'
import { randomUUID } from 'crypto'

export class DynamoService {
  private docClient: DynamoDBDocumentClient
  private vocabularyTableName: string
  private spreadsheetsTableName: string

  constructor() {
    const client = new DynamoDBClient({ region: 'ap-northeast-2' })
    this.docClient = DynamoDBDocumentClient.from(client)
    this.vocabularyTableName = 'user-vocabulary'
    this.spreadsheetsTableName = 'user-spreadsheets'
  }

  async getUserVocabulary(
    userId: string,
    filter?: 'memorized' | 'unmemorized'
  ): Promise<VocabWord[]> {
    try {
      const command = new QueryCommand({
        TableName: this.vocabularyTableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })

      const response = await this.docClient.send(command)
      let words =
        response.Items?.map(item => ({
          id: parseInt(item.wordId.split('_')[1]) || 0,
          day: item.day || 0,
          chinese: item.chinese || '',
          pinyin: item.pinyin || '',
          korean: item.korean || '',
          memorized: item.memorized || false,
          lastReviewed: item.lastReviewed,
          total: item.total || 0,
        })) || []

      // Apply filter if specified
      if (filter === 'memorized') {
        words = words.filter(word => word.memorized)
      } else if (filter === 'unmemorized') {
        words = words.filter(word => !word.memorized)
      }

      return words
    } catch (error) {
      console.error('Error getting user vocabulary:', error)
      throw error
    }
  }

  async deleteUserVocabulary(userId: string): Promise<void> {
    try {
      // First, get all items for the user
      const existingWords = await this.getUserVocabulary(userId)

      if (existingWords.length === 0) {
        return
      }

      // Delete in batches of 25 (DynamoDB limit)
      const batchSize = 25
      for (let i = 0; i < existingWords.length; i += batchSize) {
        const batch = existingWords.slice(i, i + batchSize)

        const deleteRequests = batch.map(word => ({
          DeleteRequest: {
            Key: {
              userId: userId,
              wordId: `word_${word.id}`,
            },
          },
        }))

        const command = new BatchWriteCommand({
          RequestItems: {
            [this.vocabularyTableName]: deleteRequests,
          },
        })

        await this.docClient.send(command)
      }
    } catch (error) {
      console.error('Error deleting user vocabulary:', error)
      throw error
    }
  }

  async addVocabWord(userId: string, word: VocabWord): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.vocabularyTableName,
        Item: {
          userId: userId,
          wordId: `word_${word.id}`,
          chinese: word.chinese,
          pinyin: word.pinyin,
          korean: word.korean,
          memorized: word.memorized,
          day: word.day,
          lastReviewed: word.lastReviewed || new Date().toISOString(),
          total: word.total || 0,
          createdAt: new Date().toISOString(),
        },
      })

      await this.docClient.send(command)
    } catch (error) {
      console.error('Error adding vocab word:', error)
      throw error
    }
  }

  async batchAddVocabWords(userId: string, words: VocabWord[]): Promise<void> {
    try {
      // Add in batches of 25 (DynamoDB limit)
      const batchSize = 25
      for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize)

        const putRequests = batch.map(word => ({
          PutRequest: {
            Item: {
              userId: userId,
              wordId: `word_${word.id}`,
              chinese: word.chinese,
              pinyin: word.pinyin,
              korean: word.korean,
              memorized: word.memorized,
              day: word.day,
              lastReviewed: word.lastReviewed || new Date().toISOString(),
              total: word.total || 0,
              createdAt: new Date().toISOString(),
            },
          },
        }))

        const command = new BatchWriteCommand({
          RequestItems: {
            [this.vocabularyTableName]: putRequests,
          },
        })

        await this.docClient.send(command)
      }
    } catch (error) {
      console.error('Error batch adding vocab words:', error)
      throw error
    }
  }

  async markAsMemorized(userId: string, wordId: number): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.vocabularyTableName,
        Key: {
          userId: userId,
          wordId: `word_${wordId}`,
        },
        UpdateExpression:
          'SET memorized = :memorized, lastReviewed = :lastReviewed',
        ExpressionAttributeValues: {
          ':memorized': true,
          ':lastReviewed': new Date().toISOString(),
        },
      })

      await this.docClient.send(command)
    } catch (error) {
      console.error('Error marking word as memorized:', error)
      throw error
    }
  }

  async unmarkAsMemorized(userId: string, wordId: number): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.vocabularyTableName,
        Key: {
          userId: userId,
          wordId: `word_${wordId}`,
        },
        UpdateExpression:
          'SET memorized = :memorized, lastReviewed = :lastReviewed',
        ExpressionAttributeValues: {
          ':memorized': false,
          ':lastReviewed': new Date().toISOString(),
        },
      })

      await this.docClient.send(command)
    } catch (error) {
      console.error('Error unmarking word as memorized:', error)
      throw error
    }
  }

  async incrementTotalAndUpdateLastReviewed(
    userId: string,
    wordId: number
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.vocabularyTableName,
        Key: {
          userId: userId,
          wordId: `word_${wordId}`,
        },
        UpdateExpression:
          'SET total = if_not_exists(total, :zero) + :increment, lastReviewed = :lastReviewed',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':increment': 1,
          ':lastReviewed': new Date().toISOString(),
        },
      })

      await this.docClient.send(command)
    } catch (error) {
      console.error('Error incrementing total count:', error)
      throw error
    }
  }

  // User Spreadsheets Table Methods
  async getUserSpreadsheetId(userId: string): Promise<string | null> {
    try {
      const command = new QueryCommand({
        TableName: this.spreadsheetsTableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })

      const response = await this.docClient.send(command)

      if (response.Items && response.Items.length > 0) {
        return response.Items[0].spreadsheetId || null
      }

      return null
    } catch (error) {
      console.error('Error getting user spreadsheet ID:', error)
      throw error
    }
  }

  async setUserSpreadsheetId(
    userId: string,
    spreadsheetId?: string
  ): Promise<void> {
    if (spreadsheetId === undefined) {
      throw new Error('spreadsheetId is undefined')
    }

    try {
      const command = new PutCommand({
        TableName: this.spreadsheetsTableName,
        Item: {
          userId: userId,
          spreadsheetId: spreadsheetId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })

      await this.docClient.send(command)
    } catch (error) {
      console.error('Error setting user spreadsheet ID:', error)
      throw error
    }
  }

  async deleteUserSpreadsheetId(userId: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: this.spreadsheetsTableName,
        Key: {
          userId: userId,
        },
      })

      await this.docClient.send(command)
    } catch (error) {
      console.error('Error deleting user spreadsheet ID:', error)
      throw error
    }
  }

  async clearUserVocabulary(userId: string): Promise<void> {
    try {
      // First query to get all items for the user
      const queryCommand = new QueryCommand({
        TableName: this.vocabularyTableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })

      const response = await this.docClient.send(queryCommand)

      if (response.Items && response.Items.length > 0) {
        // Delete items in batches of 25 (DynamoDB limit)
        const batchSize = 25
        for (let i = 0; i < response.Items.length; i += batchSize) {
          const batch = response.Items.slice(i, i + batchSize)

          const deleteRequests = batch.map(item => ({
            DeleteRequest: {
              Key: {
                userId: item.userId,
                wordId: item.wordId,
              },
            },
          }))

          const batchCommand = new BatchWriteCommand({
            RequestItems: {
              [this.vocabularyTableName]: deleteRequests,
            },
          })

          await this.docClient.send(batchCommand)
        }

        console.log(
          `Cleared ${response.Items.length} vocabulary items for user ${userId}`
        )
      }
    } catch (error) {
      console.error('Error clearing user vocabulary:', error)
      throw error
    }
  }
}
