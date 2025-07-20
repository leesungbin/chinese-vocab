# Chinese Vocab Serverless

AWS Lambda functions for managing Chinese vocabulary data in Google Sheets.

## Setup

1. **Google Sheets API Setup**:
   - Create a Google Cloud project
   - Enable the Google Sheets API
   - Create a service account and download the credentials JSON
   - Share your Google Sheet with the service account email
   - Copy the spreadsheet ID from the URL

2. **Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Install Dependencies**:
   ```bash
   pnpm install
   ```

## Development

```bash
# Run locally for testing
pnpm dev

# Build TypeScript
pnpm build
```

## Deployment

```bash
# Deploy to AWS
pnpm deploy

# Remove from AWS
pnpm remove
```

## API Endpoints

### GET /get-sheet
Retrieve vocabulary words from the Google Sheet.

Query parameters:
- `range`: Sheet range (default: "Sheet1!A:E")
- `filter`: "memorized", "unmemorized", or omit for all

### POST /update-sheet
Update vocabulary data in the Google Sheet.

Request body:
```json
{
  "action": "add|update|delete|mark_memorized",
  "word": {
    "chinese": "你好",
    "pinyin": "nǐ hǎo",
    "english": "hello",
    "memorized": false
  }
}
```

## Sheet Format

The Google Sheet should have columns:
- A: Chinese characters
- B: Pinyin
- C: English translation
- D: Memorized (true/false)
- E: Last reviewed date