/**
 * =============================================================================
 * ENHANCED WRITING ANALYSIS PROMPTS
 * =============================================================================
 * 
 * Improved prompts with examples, constraints, and hybrid validation
 * for more accurate hook and thesis detection.
 */

class WritingPrompts {
  
  /**
   * Enhanced structure analysis with candidate validation
   */
  generateStructureAnalysisPrompt(essay, candidates) {
    const hookCandidates = candidates.hookCandidates || []
    const thesisCandidates = candidates.thesisCandidates || []
    const topicSentenceCandidates = candidates.topicSentenceCandidates || []
    const paragraphConclusionCandidates = candidates.paragraphConclusionCandidates || []
    const overallConclusionCandidates = candidates.overallConclusionCandidates || []
    
    return `You are an expert IELTS examiner. Analyze the structural elements of this essay using the provided candidates for validation.

ESSAY TO ANALYZE:
"${essay}"

HOOK SENTENCE CANDIDATES (choose the best one):
${hookCandidates.map((c, i) => `${i + 1}. "${c.text}" (confidence: ${c.confidence}, reason: ${c.reason})`).join('\n') || 'No candidates provided'}

THESIS STATEMENT CANDIDATES (choose the best one):
${thesisCandidates.map((c, i) => `${i + 1}. "${c.text}" (confidence: ${c.confidence}, reason: ${c.reason})`).join('\n') || 'No candidates provided'}

TOPIC SENTENCE CANDIDATES (choose the best for each paragraph):
${topicSentenceCandidates.map((c, i) => `${i + 1}. Paragraph ${c.paragraphIndex}: "${c.text}" (confidence: ${c.confidence}, has transition: ${c.analysis?.hasTransition})`).join('\n') || 'No candidates provided'}

PARAGRAPH CONCLUSION CANDIDATES (choose the best for each paragraph):
${paragraphConclusionCandidates.map((c, i) => `${i + 1}. Paragraph ${c.paragraphIndex}: "${c.text}" (confidence: ${c.confidence}, summarizes main: ${c.analysis?.summarizesMain})`).join('\n') || 'No candidates provided'}

OVERALL CONCLUSION CANDIDATES (choose the best one):
${overallConclusionCandidates.map((c, i) => `${i + 1}. "${c.text}" (confidence: ${c.confidence}, restates thesis: ${c.analysis?.restatesThesis})`).join('\n') || 'No candidates provided'}

EXAMPLES OF GOOD HOOKS:
- "In today's digital age, social media has become as essential as breathing for many young people."
- "The debate over whether technology enhances or hinders human connection has never been more relevant."
- "When Steve Jobs introduced the iPhone in 2007, he couldn't have predicted its impact on education."

EXAMPLES OF STRONG THESIS STATEMENTS:
- "While technology offers unprecedented learning opportunities, excessive screen time in schools can negatively impact students' social development and critical thinking skills."
- "This essay will argue that despite concerns about privacy, the benefits of artificial intelligence in healthcare far outweigh the potential risks."
- "Although critics claim that social media damages real relationships, evidence suggests that when used mindfully, these platforms actually strengthen human connections."

EXAMPLES OF EFFECTIVE PARAGRAPH CONCLUSIONS:
- "Therefore, educational technology clearly enhances learning when properly implemented."
- "This evidence demonstrates that renewable energy is both feasible and necessary."
- "These examples show how AI can transform healthcare for the better."

EXAMPLES OF STRONG OVERALL CONCLUSIONS:
- "In conclusion, while social media presents challenges, its educational and business benefits far outweigh the drawbacks when used responsibly."
- "To conclude, the evidence clearly shows that renewable energy is not just an option, but an imperative for our future."

TASK: Evaluate each candidate and return ONLY valid JSON:

{
  "structuralAnalysis": {
    "hook": {
      "selectedCandidate": 1,
      "text": "exact text of selected hook",
      "score": "excellent|good|needs_work|poor",
      "feedback": "Why this hook works or how to improve it",
      "criteria": {
        "attention_grabbing": "excellent|good|needs_work|poor",
        "relevance_to_topic": "excellent|good|needs_work|poor",
        "clarity": "excellent|good|needs_work|poor"
      }
    },
    "thesis": {
      "selectedCandidate": 1,
      "text": "exact text of selected thesis",
      "score": "excellent|good|needs_work|poor", 
      "feedback": "Assessment of thesis strength and clarity",
      "criteria": {
        "clear_position": "excellent|good|needs_work|poor",
        "specific_claims": "excellent|good|needs_work|poor",
        "arguable": "excellent|good|needs_work|poor"
      }
    },
    "topicSentences": [
      {
        "paragraph": 1,
        "selectedCandidate": 1,
        "text": "exact text of selected topic sentence",
        "score": "excellent|good|needs_work|poor",
        "feedback": "Assessment of topic sentence effectiveness",
        "criteria": {
          "clear_main_idea": "excellent|good|needs_work|poor",
          "appropriate_transition": "excellent|good|needs_work|poor",
          "connects_to_thesis": "excellent|good|needs_work|poor"
        }
      }
    ],
    "paragraphConclusions": [
      {
        "paragraph": 1,
        "selectedCandidate": 1,
        "text": "exact text of selected paragraph conclusion",
        "score": "excellent|good|needs_work|poor",
        "feedback": "Assessment of how well this sentence concludes the paragraph",
        "criteria": {
          "summarizes_paragraph": "excellent|good|needs_work|poor",
          "draws_conclusion": "excellent|good|needs_work|poor",
          "links_to_thesis": "excellent|good|needs_work|poor"
        }
      }
    ],
    "overallConclusion": {
      "selectedCandidate": 1,
      "text": "exact text of selected conclusion",
      "score": "excellent|good|needs_work|poor",
      "feedback": "Assessment of overall conclusion effectiveness",
      "criteria": {
        "restates_thesis": "excellent|good|needs_work|poor",
        "summarizes_main_points": "excellent|good|needs_work|poor",
        "provides_closure": "excellent|good|needs_work|poor",
        "final_thought": "excellent|good|needs_work|poor"
      },
      "analysis": {
        "thesis_restatement_quality": 0.8,
        "provides_recommendation": true,
        "addresses_implications": true
      }
    },
    "overallStructure": {
      "score": "excellent|good|needs_work|poor",
      "feedback": "Assessment of essay organization",
      "paragraph_count": 4,
      "logical_flow": "excellent|good|needs_work|poor",
      "coherence_analysis": {
        "introduction_effectiveness": "excellent|good|needs_work|poor",
        "body_paragraph_unity": "excellent|good|needs_work|poor",
        "conclusion_effectiveness": "excellent|good|needs_work|poor",
        "transitions_quality": "excellent|good|needs_work|poor"
      }
    }
  }
}`
  }

  /**
   * Enhanced band score analysis with detailed criteria
   */
  generateBandScorePrompt(essay, wordCount) {
    return `You are an official IELTS examiner. Rate this Writing Task 2 essay according to the official IELTS criteria.

ESSAY TO EVALUATE:
"${essay}"

WORD COUNT: ${wordCount} words

IELTS WRITING CRITERIA EXAMPLES:

TASK RESPONSE (Band 7):
- Addresses all parts of the task
- Presents a clear position throughout
- Develops main ideas with relevant examples
- May have minor off-topic content

COHERENCE & COHESION (Band 7):
- Logically organizes information and ideas
- Uses range of cohesive devices appropriately 
- Clear central topic within each paragraph
- May have occasional errors in referencing

LEXICAL RESOURCE (Band 7):
- Uses sufficient range of vocabulary naturally
- Uses less common lexical items with awareness of style
- May produce occasional errors in word choice
- Spelling and word formation generally accurate

GRAMMATICAL RANGE & ACCURACY (Band 7):
- Uses variety of complex structures
- Frequent error-free sentences
- Good control of grammar and punctuation
- May have few errors that don't impede communication

Return ONLY valid JSON with specific band scores (1-9) and detailed justifications:

{
  "bandScores": {
    "taskResponse": {
      "score": 6,
      "justification": "Detailed analysis of how well essay addresses the task, with specific examples from the text",
      "strengths": ["Lists specific strengths"],
      "weaknesses": ["Lists specific areas for improvement"]
    },
    "coherenceCohesion": {
      "score": 6,
      "justification": "Analysis of organization and linking",
      "strengths": ["Specific organizational strengths"],
      "weaknesses": ["Specific coherence issues"]
    },
    "lexicalResource": {
      "score": 6,
      "justification": "Analysis of vocabulary range and accuracy",
      "strengths": ["Good vocabulary choices noted"],
      "weaknesses": ["Word choice issues identified"]
    },
    "grammarAccuracy": {
      "score": 6,
      "justification": "Analysis of grammar range and accuracy",
      "strengths": ["Complex structures used"],
      "weaknesses": ["Specific grammar errors noted"]
    }
  },
  "overallBand": 6.0,
  "overallFeedback": "Comprehensive feedback with specific improvement recommendations",
  "wordCountAssessment": {
    "actual": ${wordCount},
    "adequate": true,
    "feedback": "Assessment of whether word count meets requirements"
  }
}`
  }

  /**
   * Enhanced annotation prompt with precise positioning
   */
  generateAnnotationPrompt(essay, structure, hookText, thesisText) {
    return `You are an IELTS examiner creating interactive feedback. Identify specific text spans for highlighting with precise character positions.

ESSAY TO ANNOTATE:
"${essay}"

CONFIRMED STRUCTURAL ELEMENTS:
- Hook: "${hookText}"
- Thesis: "${thesisText}"

ANNOTATION TYPES:
1. STRUCTURAL ELEMENTS
   - hook: Opening sentence that grabs attention
   - thesis: Main argument statement
   - topic_sentence: First sentence of body paragraphs
   - conclusion_sentence: Final summarizing statement

2. IELTS CRITERIA FEEDBACK
   - task_response_good: Text that addresses the prompt well
   - task_response_weak: Areas that miss the task requirements
   - coherence_good: Effective linking words and transitions
   - coherence_weak: Unclear connections or jumps in logic
   - vocabulary_good: Strong word choices and academic language
   - vocabulary_weak: Repetitive or inappropriate word use
   - grammar_good: Well-constructed complex sentences
   - grammar_error: Specific grammar mistakes

CRITICAL REQUIREMENTS:
- Copy text EXACTLY as it appears
- Calculate precise startIndex and endIndex
- Include both strengths (good) and areas for improvement (weak/error)
- Prioritize the confirmed hook and thesis elements

Return ONLY valid JSON:

{
  "annotations": [
    {
      "text": "exact phrase from essay",
      "startIndex": 0,
      "endIndex": 25,
      "type": "good|needs_work|error",
      "element": "hook|thesis|topic_sentence|conclusion_sentence|task_response|coherence|vocabulary|grammar",
      "message": "Specific feedback about this text span",
      "suggestion": "How to improve (if type is needs_work or error)",
      "priority": "high|medium|low"
    }
  ]
}`
  }

  /**
   * Validation prompt for double-checking AI decisions
   */
  generateValidationPrompt(essay, selectedHook, selectedThesis) {
    return `You are a senior IELTS examiner doing quality control. Validate these structural element identifications.

ESSAY:
"${essay}"

PROPOSED IDENTIFICATIONS:
Hook: "${selectedHook}"
Thesis: "${selectedThesis}"

VALIDATION CHECKLIST:

HOOK VALIDATION:
✓ Is this the opening sentence of the essay?
✓ Does it grab the reader's attention?
✓ Is it relevant to the topic?
✓ Does it lead naturally to the thesis?

THESIS VALIDATION:  
✓ Does this clearly state the writer's position?
✓ Is it specific and arguable?
✓ Does it preview the main arguments?
✓ Is it positioned appropriately (usually end of introduction)?

Return ONLY valid JSON with your validation:

{
  "validation": {
    "hook": {
      "isCorrect": true,
      "confidence": 0.9,
      "issues": ["Any problems identified"],
      "alternative": "Alternative hook if incorrect"
    },
    "thesis": {
      "isCorrect": true,
      "confidence": 0.9,
      "issues": ["Any problems identified"], 
      "alternative": "Alternative thesis if incorrect"
    },
    "overallAccuracy": 0.9,
    "recommendations": ["Suggestions for improvement"]
  }
}`
  }
}

module.exports = WritingPrompts