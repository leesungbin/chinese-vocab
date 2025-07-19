# Chinese Vocabulary Practice

A modern web application for studying Chinese vocabulary, specifically designed for HSK Level 4 preparation. This interactive tool helps learners practice Chinese characters, pronunciation (Pinyin), and Korean meanings with various study modes and features.

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

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chinese-vocab
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

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

### Project Structure
```
chinese-vocab/
├── app/                    # Next.js app directory
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, switches, etc.)
│   └── theme-provider.tsx # Theme management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Global styles
└── chinese-vocab-practice.tsx # Main application component
```

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

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