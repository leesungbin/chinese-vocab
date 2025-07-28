# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Package Management Rule

**ALWAYS use pnpm instead of npm** - this is a monorepo with pnpm-lock.yaml. Using npm commands will cause conflicts.

```bash
# ✅ Correct
pnpm add react
pnpm frontend:dev
pnpm serverless:deploy

# ❌ Never use
npm install
npm run dev
```

## Development Commands

```bash
# Frontend (from root)
pnpm frontend:dev          # Start Next.js dev server
pnpm frontend:build        # Build for production

# Backend (from root)
pnpm serverless:deploy     # Deploy to AWS
pnpm serverless:dev        # Local development

# Monorepo (from root)
pnpm install              # Install all dependencies
pnpm dev                  # Start all packages in parallel
pnpm lint                 # Lint all packages
pnpm clean                # Clean all packages + root node_modules
```

## Architecture Overview

This is a Chinese vocabulary learning app with Google Sheets integration.

**Tech Stack:**

- Frontend: Next.js 15 + TypeScript + Tailwind CSS
- Backend: AWS Lambda + DynamoDB
- Auth: Google OAuth 2.0
- Data: Google Sheets API

**Key Integration Points:**

1. **Authentication Flow**: Google OAuth → JWT tokens → Google Sheets API access
2. **Data Flow**: User's personal Google Sheets ← Backend API ← Frontend Zustand stores
3. **State Management**: Three main Zustand stores - `themeStore`, `vocabularyStore`, `languageStore`

**Critical Files:**

- `vocabularyService.ts` - All backend API communication
- `ProtectedVocabulary.tsx` - Main app entry point
- `VocabularyPractice.tsx` - Core learning interface
- `AuthHeader.tsx` - Google OAuth handling

**Google Sheets Format:**
Required columns: `chinese`, `pinyin`, `korean`, `day`

## Development Notes

- ESLint + Prettier configured with pre-commit hooks
- i18n support: Korean/English with markdown content for privacy policy
- Theme system uses glass morphism effects via computed Tailwind classes
- JWT tokens stored in localStorage, OAuth tokens separate for Google API
- Environment setup requires `.env.example` configuration in both packages
