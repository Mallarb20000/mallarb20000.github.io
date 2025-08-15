# IELTS Writing Analyzer - Deployment Version

A standalone Next.js application for IELTS Writing Task 2 analysis with AI feedback.

## Features

- **Planning Phase**: Guided essay planning with 6 structured questions
- **Essay Writing**: Real-time word counting and writing interface  
- **AI Analysis**: Comprehensive IELTS band score analysis using Google Gemini AI
- **Detailed Reports**: Band scores, structural analysis, and improvement suggestions
- **PDF/Text Export**: Download analysis reports

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://your-backend-url:3002
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Backend Requirements

This frontend requires a backend server running the IELTS analysis API. The backend should:

- Provide `/api/writing/analyze` endpoint
- Accept POST requests with `essay` and `prompt` fields
- Return analysis results in the expected format

## Deployment

### Vercel Deployment

1. Push this folder to a GitHub repository
2. Connect the repository to Vercel
3. Set the environment variable `NEXT_PUBLIC_API_URL` in Vercel dashboard
4. Deploy

### Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of your backend API server

## Project Structure

```
src/app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (redirects to /writing)
└── writing/
    ├── page.tsx        # Main writing interface
    ├── writing.css     # Writing page styles
    └── report/
        ├── page.tsx    # Analysis report page
        └── report.css  # Report page styles
```

## Features Overview

### Planning Phase
- Essay type identification
- Hook sentence planning
- Thesis statement development
- Topic sentence structuring
- Thesis connection planning
- Conclusion and recommendation planning

### Analysis Features
- Task Response scoring
- Coherence & Cohesion analysis
- Lexical Resource evaluation
- Grammar & Accuracy assessment
- Structural analysis by essay sections
- Overall band score calculation

### Report Features
- Comprehensive band score breakdown
- Section-by-section analysis
- Improvement recommendations
- PDF and text export options
- Question context display

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules
- **AI Integration**: Backend API calls
- **Export**: Browser APIs (print/download)