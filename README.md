# Chinese Vocabulary Memory Book

A Chinese vocabulary learning app with Google Sheets integration for personalized vocabulary management.

## Features

- **Interactive Study Cards**: Progressive reveal of Chinese characters, Pinyin, and Korean meanings
- **Text-to-Speech**: Built-in pronunciation for Chinese characters
- **Personal Progress**: Mark words as memorized and track learning progress
- **Google Sheets Integration**: Automatically creates and syncs with your personal vocabulary sheets
- **Day-based Filtering**: Study specific word groups organized by learning days
- **Dark/Light Theme**: System-aware theme with manual toggle

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: AWS Lambda + API Gateway + DynamoDB
- **Authentication**: Google OAuth 2.0
- **Data Source**: Google Sheets API

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development**:
   ```bash
   pnpm frontend:dev
   ```

3. **Environment setup**:
   - Copy `.env.example` files in both `packages/frontend` and `packages/serverless`
   - Configure Google OAuth and AWS credentials

## Google Sheets Format

Your vocabulary sheet should have these columns:
- **chinese**: 汉字 (Chinese characters)
- **pinyin**: Pronunciation with tone marks
- **korean**: Korean translation
- **day**: Learning day group number

## Development

```bash
# Frontend development
pnpm frontend:dev

# Deploy serverless backend
pnpm serverless:deploy
```

---

**Built for Chinese language learners**