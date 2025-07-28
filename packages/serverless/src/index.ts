// Entry point for local development
import { GoogleSheetsService } from './services/googleSheets'

async function main() {
  try {
    console.log('Testing Google Sheets service...')

    const service = new GoogleSheetsService()
    const words = await service.getVocabWords()

    console.log(`Found ${words.length} vocabulary words:`)
    words.forEach((word, index) => {
      console.log(
        `${index + 1}. ${word.chinese} (${word.pinyin}) - ${word.korean} [${word.memorized ? 'Memorized' : 'Not memorized'}]`
      )
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

if (require.main === module) {
  main()
}
