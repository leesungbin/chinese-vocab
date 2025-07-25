# 중국어 단어 암기장 (Chinese Vocabulary Memory Book)

A comprehensive Chinese vocabulary learning application built with Next.js and AWS serverless architecture. Features user authentication, personal vocabulary management, and seamless Google Sheets integration for vocabulary data management.

## 🌟 Features

### 📚 Core Learning Features
- **Interactive Vocabulary Cards**: Study Chinese characters with progressive reveal system
- **Multi-language Support**: Chinese characters, Pinyin pronunciation, and Korean meanings
- **Text-to-Speech**: Built-in pronunciation support for Chinese characters
- **Progressive Learning**: Customizable display settings (Chinese, Pinyin, Korean)
- **Memorization Tracking**: Mark words as memorized with visual indicators

### 🎯 Study Tools
- **Shuffle Mode**: Randomize word order for varied practice sessions
- **Day-based Filtering**: Study specific groups organized by learning days
- **Sequential Navigation**: Previous/Next controls with progress tracking
- **Word Order Controls**: Reset to original order or maintain shuffle state
- **Progress Visualization**: Current position indicator and completion tracking

### 👤 User Management
- **Google OAuth Authentication**: Secure login with Google accounts
- **Anonymous Mode**: Practice without account for casual users
- **User-specific Data**: Personal vocabulary progress and memorization status
- **Automatic Sync**: Seamless switching between anonymous and authenticated modes

### 🔧 Google Sheets Integration
- **Dynamic Data Loading**: Vocabulary fetched from Google Sheets in real-time
- **Automatic Sheet Creation**: Personal sheets created automatically for new users
- **Permission Management**: Automatic editor permissions for users and service account
- **Data Migration**: Transfer data between different Google Sheets
- **Error Handling**: Comprehensive error messages for sheet operations

### 🎨 User Interface
- **Modern Design**: Glass morphism UI with backdrop blur effects
- **Dark/Light Theme**: System-aware theme with manual toggle
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Accessible Controls**: Keyboard navigation and screen reader support
- **Settings Page**: Dedicated `/settings` route for configuration

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.4.2 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand for vocabulary and theme state
- **Authentication**: Google OAuth 2.0
- **Theme Management**: next-themes with system preference detection

### Backend & Infrastructure
- **Runtime**: AWS Lambda (Node.js)
- **API**: AWS API Gateway with CORS support
- **Database**: Amazon DynamoDB for user data
- **Authentication**: JWT tokens with Google OAuth
- **External APIs**: Google Sheets API v4, Google Drive API v3
- **Deployment**: Serverless Framework
- **Environment**: AWS Cloud with environment-specific configurations

## 📁 Project Structure

```
chinese-vocab/
├── packages/
│   ├── frontend/                    # Next.js Application
│   │   ├── app/                     # Next.js 15 App Router
│   │   │   ├── layout.tsx           # Root layout with metadata
│   │   │   ├── page.tsx             # Main vocabulary practice page
│   │   │   └── settings/            # Settings page route
│   │   ├── components/              # React Components
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── ui/                  # Reusable UI components (shadcn/ui)
│   │   │   └── vocabulary-practice/ # Vocabulary-specific components
│   │   ├── contexts/                # React contexts (Auth)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── stores/                  # Zustand stores
│   │   ├── utils/                   # Utility functions
│   │   └── config/                  # Configuration files
│   │
│   └── serverless/                  # AWS Lambda Backend
│       ├── src/
│       │   ├── handlers/            # Lambda function handlers
│       │   │   ├── getVocabulary.ts         # Fetch vocabulary data
│       │   │   ├── getAnonymousVocabulary.ts # Anonymous user data
│       │   │   ├── createUserSpreadsheet.ts # Auto-create user sheets
│       │   │   └── refreshAnonymousData.ts  # Refresh anonymous data
│       │   ├── services/            # Service layer
│       │   │   └── dynamoService.ts # DynamoDB operations
│       │   └── middleware/          # Authentication middleware
│       ├── serverless.yml           # Serverless Framework configuration
│       └── .env                     # Environment variables
│
├── package.json                     # Root workspace configuration
└── pnpm-workspace.yaml             # pnpm workspace setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- AWS CLI configured (for serverless deployment)
- Google Cloud Platform account (for Sheets API)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd chinese-vocab
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   ```bash
   # Frontend environment
   cd packages/frontend
   cp .env.example .env.local
   # Configure NEXT_PUBLIC_API_URL and other frontend variables
   
   # Serverless environment  
   cd ../serverless
   cp .env.example .env
   # Configure AWS, Google Sheets API, and JWT credentials
   ```

4. **Development**:
   ```bash
   # Start frontend development server
   pnpm frontend:dev
   # Navigate to http://localhost:3000
   
   # Deploy serverless functions (in separate terminal)
   pnpm serverless:deploy
   ```

## 📜 Available Scripts

### Root Level
- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm clean` - Clean all packages

### Frontend (`packages/frontend`)
- `pnpm dev` - Start development server (port 3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Serverless (`packages/serverless`)
- `pnpm deploy` - Deploy to AWS with Serverless Framework
- `pnpm deploy:dev` - Deploy to development environment
- `pnpm remove` - Remove deployed stack from AWS
- `pnpm logs` - View AWS Lambda logs

## 💡 Usage Guide

### Authentication
- **Anonymous Mode**: Start practicing immediately without signing in
- **Google Sign-In**: Click "Sign in with Google" for personalized features
- **Automatic Sync**: Seamlessly switch between anonymous and authenticated modes

### Vocabulary Practice
1. **Navigation Controls**:
   - Use **Previous/Next** buttons to navigate through vocabulary
   - View **progress indicator** showing current position
   - **Theme toggle** (sun/moon icon) for comfortable studying

2. **Word Order & Filtering** (Main Interface):
   - **Shuffle Words**: Randomize vocabulary order for varied practice
   - **Reset Order**: Return to original sequence and clear filters
   - **Day Filters**: Study specific day groups when available

3. **Progressive Learning**:
   - **Reveal Controls**: Click to show Chinese, Pinyin, or Korean meanings
   - **Text-to-Speech**: Click speaker icon for pronunciation
   - **Memorization**: Mark words as memorized with checkmark button

### Settings Page (`/settings`)
- **Display Preferences**: Toggle auto-display for Chinese, Pinyin, Korean
- **Show Memorized Words**: Choose whether to include memorized vocabulary
- **Google Sheets Management**: 
  - View/edit your personal Google Sheet
  - Migrate data between sheets
  - Automatic sheet creation for new users
- **Memorized Words Reset**: Clear all memorization progress

### Google Sheets Integration
- **Automatic Setup**: Personal sheets created automatically for authenticated users
- **Real-time Sync**: Vocabulary data loads from Google Sheets dynamically  
- **Permission Management**: Automatic editor permissions for seamless access
- **Error Handling**: Comprehensive error messages for troubleshooting

## 📊 Data Management

### Google Sheets Format
The application expects vocabulary data in Google Sheets with these columns:
- **Chinese**: Chinese characters (汉字)
- **Pinyin**: Romanized pronunciation with tone marks
- **Korean**: Korean translation/meaning
- **Day**: Learning day group number (for filtering)

### Data Flow
1. **Anonymous Users**: Read from default anonymous Google Sheet
2. **Authenticated Users**: Personal Google Sheets automatically created
3. **Data Migration**: Transfer between sheets via settings page
4. **Real-time Updates**: Changes reflected immediately in the application

## ⚙️ Configuration & Deployment

### Environment Variables

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=https://your-api-gateway-url/dev
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

#### Serverless (`.env`)
```bash
# AWS Configuration
AWS_REGION=ap-northeast-2
AWS_PROFILE=your-aws-profile

# Google APIs
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Authentication
JWT_SECRET=your-jwt-secret-key

# DynamoDB
DYNAMODB_TABLE_NAME=chinese-vocab-users
```

### AWS Setup
1. **Configure AWS CLI** with appropriate credentials
2. **Create DynamoDB Table**: `chinese-vocab-users` with `userId` as partition key
3. **Deploy Serverless Functions**:
   ```bash
   cd packages/serverless
   pnpm deploy
   ```

### Google Cloud Setup
1. **Enable APIs**: Google Sheets API v4, Google Drive API v3
2. **Create Service Account**: Download credentials JSON
3. **OAuth 2.0 Client**: For frontend authentication
4. **Share Anonymous Sheet**: With service account email as editor

## 🤝 Contributing

1. **Fork the repository** and clone locally
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** following the existing code style
4. **Test thoroughly** on both frontend and serverless components
5. **Commit changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request** with detailed description

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Maintain responsive design principles
- Test authentication flows (anonymous ↔ authenticated)
- Ensure Google Sheets integration works correctly

## 📝 License

This project is created for personal Chinese vocabulary learning purposes. Feel free to use and modify for educational purposes.

## 🙏 Acknowledgments

- **UI Framework**: [Next.js](https://nextjs.org/) with App Router
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives via [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom glass morphism
- **Icons**: [Lucide React](https://lucide.dev/) for consistent iconography
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) for lightweight state
- **Authentication**: Google OAuth 2.0 integration
- **Infrastructure**: AWS Lambda + API Gateway + DynamoDB
- **Package Management**: [pnpm](https://pnpm.io/) for efficient dependency management

---

**Built with ❤️ for Chinese language learners**