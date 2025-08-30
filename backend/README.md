# ScoreSpoken Writing Backend

Minimal backend for IELTS Writing functionality including essay analysis and AI coaching chat.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Start server:**
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

## Environment Variables

Required:
- `GEMINI_API_KEY` - Google Gemini AI API key

Optional:
- `PORT` - Server port (default: 3002)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

### Writing Analysis
- `POST /api/writing/analyze` - Analyze essay with AI
- `GET /api/writing/test` - Test AI service
- `GET /api/writing/questions/random` - Get random practice question

### Chat Sessions
- `POST /start-enhanced` - Start AI coaching session
- `POST /:chatId/message` - Send message to AI coach
- `GET /:chatId/plan` - Get essay plan state
- `PUT /:chatId/plan` - Update essay plan

### Health
- `GET /health` - Server health check
- `GET /` - Service info

## Features

- ✅ AI-powered essay analysis
- ✅ Conversational AI coaching
- ✅ Essay planning workflow
- ✅ Structure detection
- ✅ Band score calculation
- ✅ Error handling

## Architecture

This is a minimal version focused only on writing functionality. It includes:

- Express.js server with CORS
- Google Gemini AI integration
- Essay structure analysis
- Conversational AI coaching
- In-memory session storage
- Basic error handling and logging

## Dependencies

Core:
- `express` - Web framework
- `@google/generative-ai` - Gemini AI
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables