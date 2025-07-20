# Chinese Vocabulary Learning App - Monorepo

A monorepo containing a Next.js frontend for Chinese vocabulary practice and serverless backend for Google Sheets integration. Specifically designed for HSK Level 4 preparation with modern cloud architecture.

## Features

### 🎯 Core Learning Features
- **Interactive Vocabulary Cards**: Study Chinese characters with progressive reveal system
- **Pronunciation Support**: Built-in text-to-speech for Chinese characters
- **Multi-language Support**: Chinese characters, Pinyin pronunciation, and Korean meanings
- **Progressive Learning**: Choose what to show/hide (Chinese, Pinyin, Korean) based on your study needs

### 📚 Study Modes
- **Shuffle Mode**: Randomize word order for varied practice sessions
- **Day-based Filtering**: Study specific groups of words organized by day
- **Sequential Learning**: Navigate through vocabulary in order with previous/next controls
- **Progress Tracking**: Visual progress bar showing current position in vocabulary set

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes for comfortable studying in any environment
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Glass Morphism UI**: Modern, elegant interface with backdrop blur effects
- **Smooth Animations**: Polished transitions and interactions

### 📊 Data Management
- **Google Sheets Integration**: Vocabulary data is fetched from Google Sheets for easy management
- **Real-time Updates**: Data is loaded dynamically from the cloud
- **Flexible Data Structure**: Supports additional fields like study frequency tracking

## Tech Stack

- **Framework**: Next.js 15.2.4 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Theme Management**: next-themes
- **Build Tool**: Next.js built-in bundler

## Project Structure

```
chinese-vocab/
├── packages/
│   ├── frontend/          # Next.js app for vocabulary practice
│   └── serverless/        # AWS Lambda functions for Google Sheets API
├── package.json           # Root workspace configuration
└── pnpm-workspace.yaml    # pnpm workspace setup
```

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Frontend development**:
   ```bash
   pnpm frontend:dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

3. **Serverless development**:
   ```bash
   cd packages/serverless
   cp .env.example .env
   # Configure your Google Sheets credentials
   pnpm dev
   ```

## Available Scripts

### Root Level
- `pnpm build` - Build all packages
- `pnpm dev` - Start all packages in development mode
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean all packages

### Frontend Specific
- `pnpm frontend:dev` - Start frontend development server
- `pnpm frontend:build` - Build frontend for production

### Serverless Specific  
- `pnpm serverless:dev` - Start serverless development
- `pnpm serverless:deploy` - Deploy to AWS

## Usage

### Basic Navigation
- Use **Previous/Next** buttons to navigate through vocabulary
- Click the **progress bar** to see your current position
- Use **theme toggle** (sun/moon icon) to switch between light and dark modes

### Study Controls
1. **Display Settings**: Toggle what information is always visible
   - Always show Chinese characters
   - Always show Pinyin pronunciation
   - Always show Korean meanings

2. **Word Order & Filtering**:
   - **Shuffle Words**: Randomize the order of vocabulary for varied practice
   - **Reset Order**: Return to original order and clear all filters
   - **Day Filters**: Study specific day groups (appears when day data is available)

### Learning Modes
- **Progressive Reveal**: When auto-display is off, use reveal buttons to gradually show information
- **Audio Practice**: Click the volume icon to hear Chinese pronunciation
- **Filtered Study**: Focus on specific day groups for targeted learning

## Data Source

The application fetches vocabulary data from a Google Sheets document. The expected data format includes:
- **Chinese**: Chinese characters
- **Pinyin**: Pronunciation guide
- **Korean**: Korean meaning/translation
- **Day**: Day group number for filtering (optional)
- **Total**: Study frequency tracking (optional)

To use your own vocabulary data:
1. Create a Google Sheets document with the required columns
2. Make the sheet publicly accessible
3. Update the `spreadsheetId` in the `fetchVocabularyData` function in `chinese-vocab-practice.tsx`

## Development

## Packages

### Frontend (`packages/frontend`)
Next.js application with vocabulary practice features including:
- Chinese character practice
- Pinyin and English translations
- Progress tracking
- Responsive UI with Tailwind CSS

### Serverless (`packages/serverless`)
AWS Lambda functions for Google Sheets integration:
- Read vocabulary data from Google Sheets
- Update memorization status
- Add/edit/delete vocabulary words
- RESTful API endpoints

## Setup Google Sheets Integration

1. Create a Google Cloud project and enable Sheets API
2. Create a service account and download credentials
3. Share your Google Sheet with the service account email
4. Configure environment variables in `packages/serverless/.env`

See `packages/serverless/README.md` for detailed setup instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is created for personal HSK Level 4 study purposes.

## Acknowledgments

- Initial UI design generated with [v0.dev](https://v0.dev/) by Vercel
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Package management with [pnpm](https://pnpm.io/)