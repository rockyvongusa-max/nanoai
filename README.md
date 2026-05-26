# NanoAI - Your Personal AI Assistant

A sleek, glassmorphism AI chat platform powered by **MiniMax-M2.7** with streaming reasoning visualization.

## ✨ Features

- 💬 **Chat Modes**: 6 specialized presets (Chat, Tasks, Design, Code, Research, Writing)
- 🧠 **Thinking Visualization**: Collapsible accordion showing the model's reasoning process
- 🔐 **Secure API Key Storage**: AES-256-GCM encryption for user API keys
- 🎨 **Glassmorphism UI**: Dark, frosted-glass aesthetic with smooth animations
- 🔍 **Deep Research Mode**: Toggle for exhaustive, multi-step reasoning
- 📡 **Real-time Streaming**: SSE-powered live responses

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
MINIMAX_API_KEY=your-minimax-api-key
DB_ENCRYPTION_KEY=your-32-char-encryption-key
```

### 3. Set up Supabase Database
Run the SQL migration in `supabase/migrations/001_schema.sql` in your Supabase SQL Editor.

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Streaming chat endpoint
│   │   └── settings/save-key  # API key encryption endpoint
│   ├── globals.css            # Glassmorphism styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main chat page
├── components/
│   ├── ChatWindow.tsx         # Main chat interface
│   ├── Sidebar.tsx            # Chat history & spaces
│   └── SettingsPanel.tsx      # API key management
└── lib/
    ├── crypto.ts              # AES-256-GCM encryption
    ├── store.ts               # Zustand state management
    ├── supabase.ts            # Supabase client
    └── types.ts               # TypeScript definitions
```

## 🔑 API Key Security

User API keys are encrypted server-side with **AES-256-GCM** before storage:
- Random IV per encryption
- Auth tag for tampering detection
- Keys never touch the browser or localStorage

## 🎯 Preset Modes

| Mode | Temperature | Use Case |
|------|-------------|----------|
| Chat | 0.7 | General conversation |
| Tasks | 0.2 | Structured task planning |
| Design | 0.8 | Creative UI/UX work |
| Code | 0.1 | Programming & debugging |
| Research | 0.3 | Deep analysis & synthesis |
| Writing | 0.9 | Creative storytelling |

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **AI**: MiniMax-M2.7 via AI SDK

## 🚢 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy to Vercel:
```bash
npx vercel deploy --yes --token=YOUR_TOKEN
```