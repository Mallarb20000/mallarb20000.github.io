/**
 * =============================================================================
 * WRITING ANALYSIS ROUTES
 * =============================================================================
 * 
 * API endpoints for IELTS Writing Task 2 analysis with dual grading:
 * - Structure Analysis (thesis, topic sentences, conclusion)
 * - Overall Band Score with detailed criteria breakdown
 */

const express = require('express')
const router = express.Router()
const AIFactory = require('../../services/ai/AIFactory')
const EssayStructureAnalyzer = require('../../utils/EssayStructureAnalyzer')
const WritingPrompts = require('../../services/ai/prompts/WritingPrompts')

/**
 * Analyze IELTS Writing Task 2 Essay
 * POST /api/writing/analyze
 */
router.post('/analyze', 
  async (req, res, next) => {
    const startTime = Date.now()
    try {
      const { essay, prompt } = req.body
      const userId = req.user?.uid || 'anonymous'
      const wordCount = essay.split(/\s+/).length
      
      // Log analytics
      console.log(`📊 Analysis request: wordCount=${wordCount}, userId=${userId}`)
      
      // Get AI service
      const config = require('../../config')
      const aiService = AIFactory.create(config.ai)
      
      // Enable real AI analysis
      console.log('=== STARTING REAL AI ANALYSIS ===')
      console.log('Essay text:', JSON.stringify(essay))
      console.log('Essay word count:', wordCount)
      console.log('Essay length:', essay.length)
      
      const analysisResult = await analyzeEssayDualGrading(aiService, essay, prompt)
      
      // TODO: Save analysis to database (temporarily disabled for testing)
      // const databaseService = await getSupabaseService()
      // const submission = await databaseService.saveWritingSubmission(userId, {
      //   essay,
      //   prompt,
      //   analysis: analysisResult,
      //   timestamp: new Date().toISOString()
      // })
      
      // Log successful analysis
      const analysisTime = Date.now() - startTime
      console.log(`✅ Analysis completed for user ${userId}`, {
        overallBand: analysisResult.overallBand,
        wordCount: wordCount,
        analysisTime: `${analysisTime}ms`
      })
      
      console.log('Sending analysis result:', JSON.stringify(analysisResult, null, 2))
      
      res.json({
        success: true,
        submissionId: 'temp-' + Date.now(),
        analysis: analysisResult,
        meta: {
          analysisTime,
          wordCount
        }
      })
      
    } catch (error) {
      const analysisTime = Date.now() - startTime
      console.error(`❌ Analysis failed after ${analysisTime}ms:`, error.message)
      console.error('Error stack:', error.stack)
      
      res.status(500).json({
        success: false,
        error: 'Analysis failed. Please try again.',
        details: error.message,
        stack: error.stack,
        meta: {
          analysisTime,
          wordCount: req.body.essay?.split(/\s+/).length || 0
        }
      })
    }
  }
)

/**
 * Test AI Service
 * GET /api/writing/test
 */
router.get('/test', async (req, res) => {
  try {
    const config = require('../../config')
    const aiService = AIFactory.create(config.ai)
    
    const testPrompt = 'Return this exact JSON: {"test": "success", "message": "AI is working"}'
    const response = await aiService.generateResponse(testPrompt)
    
    res.json({
      success: true,
      prompt: testPrompt,
      response: response,
      responseLength: response.length
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
})

/**
 * Get Writing Analysis History (Disabled - no database)
 * GET /api/writing/history
 */
router.get('/history', async (req, res, next) => {
    res.json({
      success: true,
      history: [],
      message: 'History feature requires database setup'
    })
  }
)


/**
 * Start Enhanced Chat Session
 * POST /api/writing/start-enhanced
 */
router.post('/start-enhanced', async (req, res) => {
  try {
    // Generate unique chat session ID
    const chatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // Initialize chat session with enhanced features
    const session = {
      chatId,
      startTime: new Date().toISOString(),
      status: 'active',
      mode: 'enhanced',
      features: ['realtime_feedback', 'contextual_guidance', 'adaptive_prompts']
    }
    
    res.json({
      success: true,
      chatId,
      session,
      message: 'Enhanced chat session started successfully'
    })
    
  } catch (error) {
    console.error('Failed to start enhanced chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start enhanced chat session'
    })
  }
})

/**
 * Start Basic Chat Session
 * POST /start
 */
router.post('/start', async (req, res) => {
  try {
    // Generate unique chat session ID
    const chatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // Initialize basic chat session
    const session = {
      chatId,
      startTime: new Date().toISOString(),
      status: 'active',
      mode: 'basic'
    }
    
    res.json({
      success: true,
      chatId,
      session,
      message: 'Chat session started successfully'
    })
    
  } catch (error) {
    console.error('Failed to start chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start chat session'
    })
  }
})

/**
 * Get Random Writing Question
 * GET /api/writing/questions/random
 */
router.get('/questions/random', async (req, res) => {
  try {
    // Sample IELTS Writing Task 2 questions
    const sampleQuestions = [
      {
        id: 1,
        question: "Some people believe that technology has made our lives more complicated. Others argue that it has made life easier. Discuss both views and give your own opinion.",
        type: "opinion",
        topic: "technology",
        difficulty: "intermediate"
      },
      {
        id: 2,
        question: "In many countries, the amount of crime is increasing. What do you think are the main causes of crime? How can we deal with those causes?",
        type: "problem_solution",
        topic: "social_issues",
        difficulty: "intermediate"
      },
      {
        id: 3,
        question: "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake. Discuss both sides and give your opinion.",
        type: "opinion",
        topic: "education",
        difficulty: "advanced"
      },
      {
        id: 4,
        question: "The rise of social media has affected personal relationships and society as a whole. Do the advantages of social media outweigh the disadvantages?",
        type: "advantages_disadvantages",
        topic: "social_media",
        difficulty: "intermediate"
      },
      {
        id: 5,
        question: "Some people believe that children should be taught to compete in school while others believe they should be taught to cooperate. What is your opinion?",
        type: "opinion",
        topic: "education",
        difficulty: "intermediate"
      }
    ];

    // Select a random question
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    const randomQuestion = sampleQuestions[randomIndex];

    res.json({
      success: true,
      question: randomQuestion
    });

  } catch (error) {
    console.error('Failed to get random writing question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get random question'
    });
  }
});

/**
 * Get Specific Writing Analysis (Disabled - no database)
 * GET /api/writing/:submissionId
 */
router.get('/:submissionId', async (req, res, next) => {
    res.status(404).json({
      success: false,
      error: 'Submission storage requires database setup'
    })
  }
)

/**
 * Extract JSON from AI response that might contain extra text
 */
function extractJSON(response) {
  try {
    // Clean the response first
    let cleanResponse = response.trim()
    
    // Remove common markdown formatting
    cleanResponse = cleanResponse.replace(/```json\s*/gi, '')
    cleanResponse = cleanResponse.replace(/```\s*$/gi, '')
    cleanResponse = cleanResponse.replace(/^```\s*/gi, '')
    
    // Try parsing the cleaned response
    try {
      return JSON.parse(cleanResponse)
    } catch (parseError) {
      // Try to find JSON within the response using more flexible regex
      const jsonMatches = cleanResponse.match(/\{[\s\S]*\}/g)
      if (jsonMatches && jsonMatches.length > 0) {
        // Try parsing each match (in case there are multiple JSON objects)
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match)
            if (parsed && typeof parsed === 'object') {
              return parsed
            }
          } catch (innerError) {
            continue
          }
        }
      }
      
      // If all else fails, log the response and throw error
      console.error('Failed to extract JSON from response:', cleanResponse.substring(0, 500))
      throw new Error(`Could not extract valid JSON: ${parseError.message}`)
    }
  } catch (error) {
    console.error('JSON extraction failed:', error.message)
    throw error
  }
}

/**
 * Enhanced Hybrid Analysis Function
 * Combines rule-based structure detection with AI validation
 */
async function analyzeEssayDualGrading(aiService, essay, prompt = null) {
  const wordCount = essay.split(/\s+/).length
  const structureAnalyzer = new EssayStructureAnalyzer()
  const writingPrompts = new WritingPrompts()
  
  console.log('🔍 Starting hybrid essay analysis...')
  
  // STEP 1: Rule-based structure analysis
  console.log('📐 Performing rule-based structure analysis...')
  const structureAnalysis = structureAnalyzer.analyzeStructure(essay)
  
  console.log(`📊 Structure detected: ${structureAnalysis.paragraphCount} paragraphs, ${structureAnalysis.sentenceCount} sentences`)
  console.log(`🎣 Hook candidates: ${structureAnalysis.hookCandidates.length}`)
  console.log(`📝 Thesis candidates: ${structureAnalysis.thesisCandidates.length}`)
  console.log(`📋 Topic sentence candidates: ${structureAnalysis.topicSentenceCandidates.length}`)
  console.log(`🔚 Paragraph conclusion candidates: ${structureAnalysis.paragraphConclusionCandidates.length}`)
  console.log(`🏁 Overall conclusion candidates: ${structureAnalysis.overallConclusionCandidates.length}`)
  
  // STEP 2: AI-enhanced structure validation
  console.log('🤖 AI validating structure candidates...')
  const structurePrompt = writingPrompts.generateStructureAnalysisPrompt(essay, {
    hookCandidates: structureAnalysis.hookCandidates,
    thesisCandidates: structureAnalysis.thesisCandidates,
    topicSentenceCandidates: structureAnalysis.topicSentenceCandidates,
    paragraphConclusionCandidates: structureAnalysis.paragraphConclusionCandidates,
    overallConclusionCandidates: structureAnalysis.overallConclusionCandidates
  })
  
  const bandScorePrompt = writingPrompts.generateBandScorePrompt(essay, wordCount)
  
  // Execute both analyses in parallel
  const [structureResponse, bandScoreResponse] = await Promise.all([
    aiService.generateResponse(structurePrompt),
    aiService.generateResponse(bandScorePrompt)
  ])

  // Parse responses with enhanced error handling
  let enhancedStructureAnalysis, bandScoreAnalysis
  
  try {
    console.log('=== ENHANCED STRUCTURE ANALYSIS ===')
    console.log('Response length:', structureResponse.length)
    enhancedStructureAnalysis = extractJSON(structureResponse)
    console.log('AI selected hook:', enhancedStructureAnalysis?.structuralAnalysis?.hook?.text)
    console.log('AI selected thesis:', enhancedStructureAnalysis?.structuralAnalysis?.thesis?.text)
  } catch (error) {
    console.error('Failed to parse enhanced structure analysis:', error.message)
    // Fallback to rule-based results
    enhancedStructureAnalysis = createFallbackStructureAnalysis(structureAnalysis)
  }
  
  try {
    console.log('=== BAND SCORE ANALYSIS ===')
    console.log('Response length:', bandScoreResponse.length)
    bandScoreAnalysis = extractJSON(bandScoreResponse)
    console.log('Overall band score:', bandScoreAnalysis?.overallBand)
  } catch (error) {
    console.error('Failed to parse band score analysis:', error.message)
    bandScoreAnalysis = createFallbackBandAnalysis(wordCount)
  }

  // STEP 3: Create enhanced annotations with confirmed elements
  console.log('✨ Creating enhanced text annotations...')
  const selectedHook = enhancedStructureAnalysis?.structuralAnalysis?.hook?.text || 
                       (structureAnalysis.hookCandidates[0]?.text || '')
  const selectedThesis = enhancedStructureAnalysis?.structuralAnalysis?.thesis?.text || 
                         (structureAnalysis.thesisCandidates[0]?.text || '')
  
  const annotations = await createEnhancedAnnotations(
    aiService, 
    essay, 
    selectedHook, 
    selectedThesis,
    writingPrompts
  )

  // STEP 4: Optional validation step for high-stakes scenarios
  if (selectedHook && selectedThesis) {
    console.log('✅ Running validation check...')
    await validateStructuralElements(aiService, essay, selectedHook, selectedThesis, writingPrompts)
  }

  // Combine all analyses with metadata
  return {
    wordCount,
    timestamp: new Date().toISOString(),
    structuralAnalysis: enhancedStructureAnalysis?.structuralAnalysis || createFallbackStructureAnalysis(structureAnalysis).structuralAnalysis,
    bandScores: bandScoreAnalysis?.bandScores || {},
    overallBand: bandScoreAnalysis?.overallBand || calculateOverallBand(bandScoreAnalysis?.bandScores),
    overallFeedback: bandScoreAnalysis?.overallFeedback || '',
    annotations,
    metadata: {
      analysisMethod: 'hybrid_rule_ai',
      ruleBasedCandidates: {
        hookCandidates: structureAnalysis.hookCandidates.length,
        thesisCandidates: structureAnalysis.thesisCandidates.length
      },
      structureMetadata: structureAnalysis.metadata,
      confidence: calculateConfidenceScore(enhancedStructureAnalysis, bandScoreAnalysis)
    },
    prompt: prompt || null
  }
}

/**
 * Create fallback structure analysis from rule-based results
 */
function createFallbackStructureAnalysis(ruleBasedAnalysis) {
  const bestHook = ruleBasedAnalysis.hookCandidates[0]
  const bestThesis = ruleBasedAnalysis.thesisCandidates[0]
  
  return {
    structuralAnalysis: {
      hook: {
        selectedCandidate: 1,
        text: bestHook?.text || '',
        score: bestHook ? 'needs_work' : 'poor',
        feedback: bestHook ? `Identified as opening sentence: ${bestHook.reason}` : 'No hook sentence found.',
        criteria: {
          attention_grabbing: 'needs_work',
          relevance_to_topic: 'needs_work', 
          clarity: 'needs_work'
        }
      },
      thesis: {
        selectedCandidate: 1,
        text: bestThesis?.text || '',
        score: bestThesis ? 'needs_work' : 'poor',
        feedback: bestThesis ? `Identified thesis candidate: ${bestThesis.reason}` : 'No thesis statement found.',
        criteria: {
          clear_position: 'needs_work',
          specific_claims: 'needs_work',
          arguable: 'needs_work'
        }
      },
      topicSentences: ruleBasedAnalysis.topicSentenceCandidates.map(ts => ({
        paragraph: ts.paragraphIndex,
        text: ts.text,
        score: 'needs_work',
        feedback: `Topic sentence candidate: ${ts.reason}`
      })),
      conclusion: {
        score: 'needs_work',
        feedback: 'Conclusion analysis requires AI validation.',
        restates_thesis: false,
        provides_closure: false
      },
      overallStructure: {
        score: ruleBasedAnalysis.metadata.hasIntroduction && ruleBasedAnalysis.metadata.hasConclusion ? 'needs_work' : 'poor',
        feedback: `Essay has ${ruleBasedAnalysis.metadata.paragraphCount} paragraphs with ${ruleBasedAnalysis.metadata.hasIntroduction ? 'introduction' : 'no introduction'} and ${ruleBasedAnalysis.metadata.hasConclusion ? 'conclusion' : 'no conclusion'}.`,
        paragraph_count: ruleBasedAnalysis.metadata.paragraphCount,
        logical_flow: 'needs_work'
      }
    }
  }
}

/**
 * Create fallback band analysis
 */
function createFallbackBandAnalysis(wordCount) {
  return {
    bandScores: {
      taskResponse: { score: 4, justification: "Unable to fully assess task response due to parsing error." },
      coherenceCohesion: { score: 4, justification: "Structure analysis incomplete." },
      lexicalResource: { score: 4, justification: "Vocabulary assessment incomplete." },
      grammarAccuracy: { score: 4, justification: "Grammar analysis incomplete." }
    },
    overallBand: 4,
    overallFeedback: "Analysis incomplete due to technical issues. Please try again.",
    wordCountAssessment: {
      actual: wordCount,
      adequate: wordCount >= 250,
      feedback: wordCount >= 250 ? "Word count is adequate." : "Word count is below the minimum requirement of 250 words."
    }
  }
}

/**
 * Enhanced annotation creation with confirmed elements
 */
async function createEnhancedAnnotations(aiService, essay, hookText, thesisText, writingPrompts) {
  try {
    const annotationPrompt = writingPrompts.generateAnnotationPrompt(essay, null, hookText, thesisText)
    const response = await aiService.generateResponse(annotationPrompt)
    const parsed = extractJSON(response)
    return parsed.annotations || []
  } catch (error) {
    console.error('Failed to create enhanced annotations:', error.message)
    return createBasicAnnotations(essay, hookText, thesisText)
  }
}

/**
 * Create basic annotations as fallback
 */
function createBasicAnnotations(essay, hookText, thesisText) {
  const annotations = []
  
  if (hookText) {
    const hookIndex = essay.indexOf(hookText)
    if (hookIndex !== -1) {
      annotations.push({
        text: hookText,
        startIndex: hookIndex,
        endIndex: hookIndex + hookText.length,
        type: 'good',
        element: 'hook',
        message: 'Identified hook sentence',
        priority: 'high'
      })
    }
  }
  
  if (thesisText) {
    const thesisIndex = essay.indexOf(thesisText)
    if (thesisIndex !== -1) {
      annotations.push({
        text: thesisText,
        startIndex: thesisIndex,
        endIndex: thesisIndex + thesisText.length,
        type: 'good',
        element: 'thesis',
        message: 'Identified thesis statement',
        priority: 'high'
      })
    }
  }
  
  return annotations
}

/**
 * Validate structural elements (optional quality check)
 */
async function validateStructuralElements(aiService, essay, hookText, thesisText, writingPrompts) {
  try {
    const validationPrompt = writingPrompts.generateValidationPrompt(essay, hookText, thesisText)
    const response = await aiService.generateResponse(validationPrompt)
    const validation = extractJSON(response)
    
    console.log('🔍 Validation results:')
    console.log(`Hook accuracy: ${validation?.validation?.hook?.confidence || 'unknown'}`)
    console.log(`Thesis accuracy: ${validation?.validation?.thesis?.confidence || 'unknown'}`)
    
    return validation
  } catch (error) {
    console.error('Validation failed:', error.message)
    return null
  }
}

/**
 * Calculate overall confidence score for the analysis
 */
function calculateConfidenceScore(structureAnalysis, bandAnalysis) {
  let confidence = 0.5 // Base confidence
  
  // Boost confidence if structure elements were identified
  if (structureAnalysis?.structuralAnalysis?.hook?.text) confidence += 0.2
  if (structureAnalysis?.structuralAnalysis?.thesis?.text) confidence += 0.2
  
  // Boost confidence if band analysis succeeded
  if (bandAnalysis?.overallBand && bandAnalysis.overallBand > 0) confidence += 0.1
  
  return Math.min(confidence, 1.0)
}

/**
 * Create text annotations for interactive highlighting
 */
async function createTextAnnotations(aiService, essay, structureAnalysis, bandScoreAnalysis) {
  const annotationPrompt = `You are an IELTS examiner. Analyze this essay and identify specific text spans for each structural element and IELTS criteria. Return ONLY valid JSON.

Essay: "${essay}"

Identify the exact text spans for:

STRUCTURAL ELEMENTS:
- Hook sentence (opening sentence)
- Thesis statement (main argument)
- Topic sentences (first sentence of each body paragraph)
- Conclusion sentence (final statement)

IELTS CRITERIA ISSUES:
- Task Response: Areas that address/fail to address the prompt
- Coherence & Cohesion: Linking words, transitions, paragraph organization
- Lexical Resource: Vocabulary choices (good/poor word choices)
- Grammar & Accuracy: Grammar errors and well-constructed sentences

Return this exact JSON format:
{
  "annotations": [
    {
      "text": "exact phrase copied from essay",
      "startIndex": 0,
      "endIndex": 20,
      "type": "good|needs_work|error",
      "element": "hook|thesis|topic_sentence|conclusion|task_response|coherence_cohesion|lexical_resource|grammar_accuracy",
      "message": "Brief explanation of why this text is good/problematic",
      "suggestion": "How to improve this specific text (if needed)"
    }
  ]
}

IMPORTANT: 
- Copy text EXACTLY as it appears in the essay
- Provide accurate startIndex and endIndex for each span
- Include both strengths (type: "good") and weaknesses (type: "needs_work" or "error")
- Make sure to identify the hook, thesis, and topic sentences specifically`

  try {
    console.log('Sending annotation request to AI...')
    const response = await aiService.generateResponse(annotationPrompt)
    console.log('Annotation response:', response.substring(0, 500))
    const parsed = extractJSON(response)
    console.log('Parsed annotations:', JSON.stringify(parsed.annotations || [], null, 2))
    return parsed.annotations || []
  } catch (error) {
    console.error('Failed to create text annotations:', error.message)
    console.error('Raw annotation response:', response?.substring(0, 500))
    return []
  }
}

/**
 * Calculate overall band score from individual criteria
 */
function calculateOverallBand(bandScores) {
  if (!bandScores) return 0
  
  const scores = [
    bandScores.taskResponse?.score || 0,
    bandScores.coherenceCohesion?.score || 0, 
    bandScores.lexicalResource?.score || 0,
    bandScores.grammarAccuracy?.score || 0
  ]
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  
  // Round to nearest 0.5 (IELTS convention)
  return Math.round(average * 2) / 2
}

module.exports = router