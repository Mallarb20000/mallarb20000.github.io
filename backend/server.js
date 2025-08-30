/**
 * =============================================================================
 * WRITING-FOCUSED BACKEND SERVER
 * =============================================================================
 * 
 * Minimal Express.js server for IELTS Writing functionality only.
 * Includes chat sessions, essay analysis, and AI coaching.
 */

const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

// Import configuration
const config = require('./config')

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const { requestLogger } = require('./middleware/logger')

// Import services
const AIFactory = require('./services/ai/AIFactory')

// Import routes
const writingRoutes = require('./routes/api/writing')

// =============================================================================
// CHAT UTILITIES FOR WRITING COACHING
// =============================================================================

function determineConversationMode(confidence) {
  switch (confidence) {
    case 'confident':
      return 'consultation'
    case 'getting-there':
      return 'collaboration'
    case 'still-learning':
    case 'completely-new':
    default:
      return 'discovery'
  }
}

function generateWelcomeMessage(session) {
  const { essayQuestion } = session
  
  return `Hello! I'm your AI IELTS Writing Coach, and I'm excited to help you plan a strong IELTS Writing Task 2 essay.

**Your Essay Question:**
"${essayQuestion}"

I'll guide you through a proven step-by-step planning process that will help you organize your thoughts and create a well-structured essay. We'll work together through five key steps:

1. **Question Type Identification** ← We start here
2. **Hook Sentence Development**
3. **Thesis Statement Development** 
4. **Topic Sentence Development** (2 body paragraphs)
5. **Conclusion Summary Development**

Let's begin with the most important step: understanding what type of IELTS question this is. This will determine your entire essay structure.

To begin, please select the question type from the options below.`
}

function calculatePlanProgress(planningProgress) {
  const stages = ['questionType', 'hook', 'thesis', 'body1', 'body2', 'conclusion']
  const completedStages = stages.filter(stage => planningProgress[stage] === 'completed').length
  return Math.round((completedStages / stages.length) * 100)
}

async function generateAdaptiveResponse(session, userMessage, context) {
  try {
    const aiService = app.locals.services?.ai
    
    if (!aiService) {
      throw new Error('AI service not available')
    }
    
    const prompt = buildAdaptivePrompt(session, userMessage, context)
    const response = await aiService.generateResponse(prompt)
    const parsedResponse = parseAIResponse(response, session)
    
    return parsedResponse
    
  } catch (error) {
    console.error('Failed to generate adaptive response:', error)
    return generateFallbackResponse(session, userMessage, error)
  }
}

function buildAdaptivePrompt(session, userMessage, context) {
  const { essayQuestion } = session
  
  return `You are an expert AI IELTS Writing Coach. Your persona is that of a patient, encouraging, and highly knowledgeable tutor. Your primary goal is not to give answers, but to guide the user to discover them through a structured, step-by-step planning process.

**The User's Essay Question:**
"${essayQuestion}"

You MUST keep this question as the central point of reference for the entire conversation.

**Core Workflow: State Machine**
You MUST follow this five-step workflow sequentially:

State 1: Question Type Identification
State 2: Hook Sentence Development
State 3: Thesis Statement Development
State 4: Topic Sentence Development (for 2 body paragraphs)
State 5: Conclusion Summary Development

**Output Formatting Rules:**
1. When a plan component is finalized, output: \`[PLAN_UPDATE:<plan_part>]<the finalized text>\`
2. To transition states, output: \`[STATE_UPDATE:<new_state_name>]\`

Current conversation state and user message: "${userMessage}"

Continue the conversation appropriately based on the current state and user input.`
}

function parseAIResponse(response, session) {
  let cleanText = response;
  let nextState = null;
  const planUpdates = {};
  let progressUpdates = {};

  // Parse state updates
  const stateMatch = response.match(/\[STATE_UPDATE:(\w+)\]/);
  if (stateMatch?.[1]) {
    const newStateKey = stateMatch[1];
    const stateMap = {
      'QUESTION_TYPE': 'questionType',
      'HOOK': 'hook', 
      'THESIS': 'thesis',
      'TOPIC_SENTENCE_1': 'body1',
      'TOPIC_SENTENCE_2': 'body2', 
      'CONCLUSION': 'conclusion',
      'COMPLETE': 'completed'
    };
    
    if (stateMap[newStateKey]) {
      nextState = stateMap[newStateKey];
      progressUpdates[nextState] = 'in-progress';
    }
    cleanText = cleanText.replace(stateMatch[0], '');
  }

  // Parse plan updates
  const planMatches = [...response.matchAll(/\[PLAN_UPDATE:(\w+)\]([^\[]+)/g)];
  planMatches.forEach(match => {
    const key = match[1]; 
    const value = match[2].trim();
    
    if (['questionType', 'hook', 'thesis', 'topicSentence1', 'topicSentence2', 'conclusion'].includes(key)) {
      if (key === 'topicSentence1') {
        if (!planUpdates.bodyParagraphs) planUpdates.bodyParagraphs = [...session.essayPlan.bodyParagraphs];
        planUpdates.bodyParagraphs[0] = { ...planUpdates.bodyParagraphs[0], topicSentence: value };
        progressUpdates.body1 = 'completed';
      } else if (key === 'topicSentence2') {
        if (!planUpdates.bodyParagraphs) planUpdates.bodyParagraphs = [...session.essayPlan.bodyParagraphs];
        planUpdates.bodyParagraphs[1] = { ...planUpdates.bodyParagraphs[1], topicSentence: value };
        progressUpdates.body2 = 'completed';
      } else {
        planUpdates[key] = value;
        const progressKey = key === 'topicSentence1' ? 'body1' : 
                           key === 'topicSentence2' ? 'body2' : key;
        if (['questionType', 'hook', 'thesis', 'conclusion'].includes(progressKey)) {
          progressUpdates[progressKey] = 'completed';
        }
      }
    }
    cleanText = cleanText.replace(match[0], '');
  });

  return {
    response: cleanText.trim(),
    planUpdates: Object.keys(planUpdates).length > 0 ? planUpdates : null,
    progressUpdates: Object.keys(progressUpdates).length > 0 ? progressUpdates : null,
    nextSuggestions: [],
    adaptiveHints: [],
    progressUpdate: {
      phase: session.currentPhase,
      completion: session.essayPlan.progress,
      nextSteps: []
    }
  }
}

function generateFallbackResponse(session, userMessage, error) {
  return {
    response: "I understand you want to explore this further. Let me ask you this: what aspect of the question interests you most? We can start there and build your ideas step by step.",
    planUpdates: null,
    progressUpdates: null,
    nextSuggestions: [],
    adaptiveHints: [`Sorry, I had a technical issue but I'm still here to help you!`],
    progressUpdate: {
      phase: session.currentPhase,
      completion: session.essayPlan.progress,
      nextSteps: ['Continue our conversation', 'Share your thoughts on the question']
    }
  }
}

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express()

// Trust proxy for rate limiting
app.set('trust proxy', 1)

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    
    if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      return callback(null, true)
    }
    
    const allowedOrigins = [config.server.corsOrigin].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      return callback(new Error('CORS policy violation'), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}))

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}))

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Logging
app.use(requestLogger)

// =============================================================================
// SERVICE INITIALIZATION
// =============================================================================

async function initializeServices() {
  try {
    console.log('🔧 Initializing AI service...')

    const aiService = await AIFactory.createWithHealthCheck(config.ai)
    console.log(`✅ AI service initialized (${config.ai.provider})`)

    app.locals.services = {
      ai: aiService
    }

    return true

  } catch (error) {
    console.error('❌ Service initialization failed:', error)
    return false
  }
}

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Writing Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Writing API routes
app.use('/api/writing', writingRoutes)

// Enhanced chat session endpoints
app.post('/start-enhanced', async (req, res) => {
  try {
    const { essayQuestion, userLevel } = req.body
    
    if (!essayQuestion) {
      return res.status(400).json({
        success: false,
        error: 'Essay question is required'
      })
    }
    
    const chatId = 'enhanced_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const conversationMode = determineConversationMode(userLevel?.confidence || 'still-learning')
    
    const session = {
      chatId,
      startTime: new Date().toISOString(),
      status: 'active',
      mode: 'enhanced',
      userLevel: {
        confidence: userLevel?.confidence || 'still-learning',
        preferredPace: userLevel?.preferredPace || 'medium',
        previousSessions: userLevel?.previousSessions || 0
      },
      conversationMode,
      currentPhase: 'onboarding',
      essayQuestion,
      essayPlan: {
        topic: essayQuestion,
        userView: null,
        hook: null,
        thesis: null,
        bodyParagraphs: [
          { topicSentence: null, mainPoints: [], examples: [] },
          { topicSentence: null, mainPoints: [], examples: [] }
        ],
        conclusion: null,
        progress: 0
      },
      planningProgress: {
        questionType: 'pending',
        hook: 'pending',
        thesis: 'pending',
        body1: 'pending',
        body2: 'pending',
        conclusion: 'pending'
      },
      sessionMetrics: {
        startTime: new Date(),
        messagesCount: 0,
        planningProgress: 0
      },
      conversationHistory: [],
      adaptiveHints: []
    }
    
    if (!app.locals.chatSessions) {
      app.locals.chatSessions = new Map()
    }
    app.locals.chatSessions.set(chatId, session)
    
    const welcomeMessage = generateWelcomeMessage(session)
    
    res.json({
      success: true,
      chatId,
      session: {
        chatId: session.chatId,
        userLevel: session.userLevel,
        conversationMode: session.conversationMode,
        currentPhase: session.currentPhase,
        essayQuestion: session.essayQuestion,
        planningProgress: session.planningProgress
      },
      initialMessage: welcomeMessage,
      message: 'Enhanced conversational IELTS coach session started'
    })
    
  } catch (error) {
    console.error('Failed to start enhanced chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start enhanced chat session',
      details: error.message
    })
  }
})

// Message processing
app.post('/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params
    const { message, context } = req.body
    
    if (!app.locals.chatSessions || !app.locals.chatSessions.has(chatId)) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      })
    }
    
    const session = app.locals.chatSessions.get(chatId)
    
    session.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })
    
    const aiResponse = await generateAdaptiveResponse(session, message, context)
    
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date().toISOString()
    })
    
    session.sessionMetrics.messagesCount += 1
    
    if (aiResponse.planUpdates) {
      session.essayPlan = { ...session.essayPlan, ...aiResponse.planUpdates }
    }
    
    if (aiResponse.progressUpdates) {
      session.planningProgress = { ...session.planningProgress, ...aiResponse.progressUpdates }
      session.essayPlan.progress = calculatePlanProgress(session.planningProgress)
    }
    
    app.locals.chatSessions.set(chatId, session)
    
    res.json({
      success: true,
      data: {
        response: aiResponse.response,
        planUpdates: aiResponse.planUpdates,
        progressUpdate: aiResponse.progressUpdate,
        nextSuggestions: aiResponse.nextSuggestions,
        conversationMode: session.conversationMode,
        adaptiveHints: aiResponse.adaptiveHints
      }
    })
    
  } catch (error) {
    console.error('Failed to process message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message
    })
  }
})

// Plan management
app.get('/:chatId/plan', (req, res) => {
  try {
    const { chatId } = req.params
    
    if (!app.locals.chatSessions || !app.locals.chatSessions.has(chatId)) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      })
    }
    
    const session = app.locals.chatSessions.get(chatId)
    
    res.json({
      success: true,
      chatId,
      essayPlan: session.essayPlan,
      planningProgress: session.planningProgress,
      currentPhase: session.currentPhase,
      progress: calculatePlanProgress(session.planningProgress)
    })
    
  } catch (error) {
    console.error('Failed to get plan:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve essay plan'
    })
  }
})

app.put('/:chatId/plan', (req, res) => {
  try {
    const { chatId } = req.params
    const { planUpdates, progressUpdates } = req.body
    
    if (!app.locals.chatSessions || !app.locals.chatSessions.has(chatId)) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      })
    }
    
    const session = app.locals.chatSessions.get(chatId)
    
    if (planUpdates) {
      session.essayPlan = { ...session.essayPlan, ...planUpdates }
    }
    
    if (progressUpdates) {
      session.planningProgress = { ...session.planningProgress, ...progressUpdates }
      session.essayPlan.progress = calculatePlanProgress(session.planningProgress)
    }
    
    session.sessionMetrics.planningProgress = session.essayPlan.progress
    app.locals.chatSessions.set(chatId, session)
    
    res.json({
      success: true,
      chatId,
      essayPlan: session.essayPlan,
      planningProgress: session.planningProgress,
      progress: session.essayPlan.progress,
      message: 'Essay plan updated successfully'
    })
    
  } catch (error) {
    console.error('Failed to update plan:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update essay plan'
    })
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'ScoreSpoken Writing API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      writing: '/api/writing',
      'start-enhanced': '/start-enhanced'
    }
  })
})

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

app.use(notFoundHandler)
app.use(errorHandler)

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function startServer() {
  try {
    const servicesInitialized = await initializeServices()
    
    if (!servicesInitialized) {
      console.error('❌ Failed to initialize services. Exiting...')
      process.exit(1)
    }

    const server = app.listen(config.server.port, () => {
      console.log(`
🚀 ScoreSpoken Writing Backend Started!

📍 Server: http://localhost:${config.server.port}
🔗 Health: http://localhost:${config.server.port}/health
📝 Writing API: http://localhost:${config.server.port}/api/writing

🔧 Configuration:
   Environment: ${config.server.env}
   AI Provider: ${config.ai.provider}
   AI Model: ${config.ai.model}

🎯 Features:
   ✅ Writing Analysis
   ✅ AI Coaching Chat
   ✅ Essay Planning
   ✅ Error Handling

Ready for writing requests! 🎉
      `)
    })

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Graceful shutdown initiated...')
      server.close(() => {
        console.log('✅ Writing server closed')
        process.exit(0)
      })
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

    return server

  } catch (error) {
    console.error('❌ Server startup failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = { app, startServer }