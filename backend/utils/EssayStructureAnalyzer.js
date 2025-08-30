/**
 * =============================================================================
 * ESSAY STRUCTURE ANALYZER
 * =============================================================================
 * 
 * Hybrid approach for accurate hook and thesis detection:
 * 1. Rule-based parsing for structure identification
 * 2. AI validation for content quality assessment
 * 3. Confidence scoring and fallback logic
 */

class EssayStructureAnalyzer {
  constructor() {
    this.sentenceBoundaryRegex = /[.!?]+\s+/g
    this.paragraphBoundaryRegex = /\n\s*\n/g
  }

  /**
   * Parse essay into structured components
   */
  parseEssayStructure(essay) {
    // Clean and normalize the essay
    const cleanEssay = essay.trim().replace(/\s+/g, ' ')
    
    // Split into paragraphs
    const paragraphs = this.extractParagraphs(cleanEssay)
    
    // Split into sentences with position tracking
    const sentences = this.extractSentencesWithPositions(cleanEssay)
    
    return {
      cleanEssay,
      paragraphs,
      sentences,
      wordCount: cleanEssay.split(/\s+/).length
    }
  }

  /**
   * Extract paragraphs with metadata
   */
  extractParagraphs(essay) {
    const paragraphTexts = essay.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0)
    
    return paragraphTexts.map((text, index) => ({
      index,
      text,
      type: this.classifyParagraph(text, index, paragraphTexts.length),
      sentences: this.extractSentencesWithPositions(text),
      wordCount: text.split(/\s+/).length
    }))
  }

  /**
   * Classify paragraph type based on position and content
   */
  classifyParagraph(text, index, totalParagraphs) {
    if (index === 0) return 'introduction'
    if (index === totalParagraphs - 1) return 'conclusion'
    return 'body'
  }

  /**
   * Extract sentences with start/end positions
   */
  extractSentencesWithPositions(text) {
    const sentences = []
    let lastIndex = 0
    
    // Simple sentence splitting (can be enhanced with NLP library)
    const sentenceBounds = [...text.matchAll(/[.!?]+/g)]
    
    sentenceBounds.forEach((match, index) => {
      const endIndex = match.index + match[0].length
      const sentenceText = text.slice(lastIndex, endIndex).trim()
      
      if (sentenceText.length > 0) {
        sentences.push({
          text: sentenceText,
          startIndex: lastIndex,
          endIndex: endIndex,
          index,
          wordCount: sentenceText.split(/\s+/).length
        })
      }
      
      lastIndex = endIndex
    })

    // Handle last sentence if it doesn't end with punctuation
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).trim()
      if (remaining.length > 0) {
        sentences.push({
          text: remaining,
          startIndex: lastIndex,
          endIndex: text.length,
          index: sentences.length,
          wordCount: remaining.split(/\s+/).length
        })
      }
    }

    return sentences
  }

  /**
   * Rule-based hook detection
   */
  detectHookCandidates(structure) {
    const candidates = []
    
    // Primary candidate: First sentence of introduction
    if (structure.paragraphs.length > 0 && structure.paragraphs[0].sentences.length > 0) {
      const firstSentence = structure.paragraphs[0].sentences[0]
      candidates.push({
        ...firstSentence,
        confidence: 0.9,
        reason: 'First sentence of introduction paragraph',
        type: 'hook'
      })
    }
    
    // Secondary candidate: First sentence overall (if different structure)
    if (structure.sentences.length > 0) {
      const firstOverall = structure.sentences[0]
      if (!candidates.find(c => c.text === firstOverall.text)) {
        candidates.push({
          ...firstOverall,
          confidence: 0.8,
          reason: 'First sentence of essay',
          type: 'hook'
        })
      }
    }

    return candidates.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Rule-based thesis detection
   */
  detectThesisCandidates(structure) {
    const candidates = []
    
    if (structure.paragraphs.length === 0) return candidates
    
    const introParagraph = structure.paragraphs[0]
    
    // Primary candidate: Last sentence of introduction
    if (introParagraph.sentences.length > 1) {
      const lastSentence = introParagraph.sentences[introParagraph.sentences.length - 1]
      candidates.push({
        ...lastSentence,
        confidence: 0.9,
        reason: 'Last sentence of introduction paragraph',
        type: 'thesis'
      })
    }
    
    // Secondary candidate: Second-to-last sentence of introduction
    if (introParagraph.sentences.length > 2) {
      const secondToLast = introParagraph.sentences[introParagraph.sentences.length - 2]
      candidates.push({
        ...secondToLast,
        confidence: 0.7,
        reason: 'Second-to-last sentence of introduction',
        type: 'thesis'
      })
    }
    
    // Look for thesis indicators (opinion words, position statements)
    introParagraph.sentences.forEach((sentence, index) => {
      const thesisScore = this.calculateThesisLikelihood(sentence.text)
      if (thesisScore > 0.6 && !candidates.find(c => c.text === sentence.text)) {
        candidates.push({
          ...sentence,
          confidence: thesisScore,
          reason: 'Contains thesis indicators',
          type: 'thesis'
        })
      }
    })

    return candidates.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate thesis likelihood based on content patterns
   */
  calculateThesisLikelihood(text) {
    const thesisIndicators = [
      // Opinion words
      /\b(believe|think|argue|claim|assert|maintain|contend|propose)\b/i,
      // Position statements
      /\b(should|must|need to|ought to|have to)\b/i,
      // Comparative/evaluative
      /\b(better|worse|more important|significant|crucial|essential)\b/i,
      // Stance indicators
      /\b(agree|disagree|support|oppose|favor|against)\b/i,
      // Thesis connectors
      /\b(therefore|thus|hence|consequently|as a result)\b/i
    ]
    
    let score = 0.3 // Base score
    
    thesisIndicators.forEach(pattern => {
      if (pattern.test(text)) {
        score += 0.15
      }
    })
    
    // Bonus for longer sentences (thesis tend to be substantial)
    if (text.split(/\s+/).length > 15) {
      score += 0.1
    }
    
    return Math.min(score, 1.0)
  }

  /**
   * Detect topic sentences in body paragraphs with enhanced analysis
   */
  detectTopicSentenceCandidates(structure) {
    const candidates = []
    
    structure.paragraphs.forEach(paragraph => {
      if (paragraph.type === 'body' && paragraph.sentences.length > 0) {
        // Primary candidate: First sentence
        const firstSentence = paragraph.sentences[0]
        const topicScore = this.calculateTopicSentenceLikelihood(firstSentence.text, paragraph.index)
        
        candidates.push({
          ...firstSentence,
          paragraphIndex: paragraph.index,
          confidence: Math.max(0.75, topicScore),
          reason: 'First sentence of body paragraph',
          type: 'topic_sentence',
          analysis: {
            hasTransition: this.hasTransitionWord(firstSentence.text),
            introducesMainIdea: topicScore > 0.7,
            connectsToThesis: this.hasThesisConnection(firstSentence.text)
          }
        })
        
        // Secondary candidate: Second sentence (if first is weak)
        if (paragraph.sentences.length > 1 && topicScore < 0.6) {
          const secondSentence = paragraph.sentences[1]
          const secondScore = this.calculateTopicSentenceLikelihood(secondSentence.text, paragraph.index)
          
          if (secondScore > topicScore) {
            candidates.push({
              ...secondSentence,
              paragraphIndex: paragraph.index,
              confidence: secondScore,
              reason: 'Second sentence with stronger topic indicators',
              type: 'topic_sentence',
              analysis: {
                hasTransition: this.hasTransitionWord(secondSentence.text),
                introducesMainIdea: secondScore > 0.7,
                connectsToThesis: this.hasThesisConnection(secondSentence.text)
              }
            })
          }
        }
      }
    })
    
    return candidates.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate topic sentence likelihood based on content and position
   */
  calculateTopicSentenceLikelihood(text, paragraphIndex) {
    let score = 0.5 // Base score for first sentence
    
    // Transition words for different paragraph positions
    const transitions = {
      first: /\b(first|firstly|initially|to begin with|one|primarily)\b/i,
      second: /\b(second|secondly|furthermore|moreover|additionally|another|next)\b/i,
      third: /\b(third|thirdly|finally|lastly|in addition|most importantly)\b/i,
      general: /\b(however|nevertheless|on the other hand|in contrast|similarly|likewise)\b/i
    }
    
    // Check for appropriate transitions
    if (paragraphIndex <= 3) {
      const transitionKeys = ['first', 'second', 'third'][paragraphIndex - 1] || 'general'
      if (transitions[transitionKeys]?.test(text) || transitions.general.test(text)) {
        score += 0.2
      }
    }
    
    // Topic sentence indicators
    const topicIndicators = [
      /\b(main|primary|key|important|significant|crucial)\b/i,
      /\b(reason|cause|factor|aspect|element|issue)\b/i,
      /\b(benefit|advantage|disadvantage|problem|challenge)\b/i,
      /\b(example|instance|case|situation|scenario)\b/i
    ]
    
    topicIndicators.forEach(pattern => {
      if (pattern.test(text)) score += 0.15
    })
    
    // Sentence structure indicators
    if (text.split(/\s+/).length > 12) score += 0.1 // Substantial sentences
    if (text.includes(',')) score += 0.05 // Complex structure
    
    return Math.min(score, 1.0)
  }

  /**
   * Check if sentence has transition words
   */
  hasTransitionWord(text) {
    const transitions = [
      'first', 'firstly', 'second', 'secondly', 'third', 'thirdly',
      'furthermore', 'moreover', 'additionally', 'however', 'nevertheless',
      'on the other hand', 'in contrast', 'similarly', 'likewise'
    ]
    
    return transitions.some(transition => 
      new RegExp(`\\b${transition}\\b`, 'i').test(text)
    )
  }

  /**
   * Check if sentence connects to common thesis themes
   */
  hasThesisConnection(text) {
    const thesisConnectors = [
      /\b(benefit|advantage|positive|improve|enhance)\b/i,
      /\b(problem|issue|negative|disadvantage|harmful)\b/i,
      /\b(important|significant|crucial|essential|necessary)\b/i,
      /\b(education|technology|society|economic|social)\b/i
    ]
    
    return thesisConnectors.some(pattern => pattern.test(text))
  }

  /**
   * Detect paragraph conclusion sentences
   */
  detectParagraphConclusionCandidates(structure) {
    const candidates = []
    
    structure.paragraphs.forEach(paragraph => {
      if (paragraph.type === 'body' && paragraph.sentences.length > 1) {
        const lastSentence = paragraph.sentences[paragraph.sentences.length - 1]
        const conclusionScore = this.calculateParagraphConclusionLikelihood(lastSentence.text, paragraph)
        
        candidates.push({
          ...lastSentence,
          paragraphIndex: paragraph.index,
          confidence: Math.max(0.6, conclusionScore),
          reason: 'Last sentence of body paragraph',
          type: 'paragraph_conclusion',
          analysis: {
            summarizesMain: conclusionScore > 0.7,
            hasTransition: this.hasTransitionWord(lastSentence.text),
            linksToNext: this.hasForwardLink(lastSentence.text)
          }
        })
      }
    })
    
    return candidates.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate paragraph conclusion likelihood
   */
  calculateParagraphConclusionLikelihood(text, paragraph) {
    let score = 0.4 // Base score for last sentence
    
    // Conclusion indicators
    const conclusionIndicators = [
      /\b(therefore|thus|hence|consequently|as a result)\b/i,
      /\b(in summary|overall|clearly|obviously|evidently)\b/i,
      /\b(this shows|this demonstrates|this proves|this indicates)\b/i,
      /\b(important|significant|crucial|essential|key)\b/i
    ]
    
    conclusionIndicators.forEach(pattern => {
      if (pattern.test(text)) score += 0.15
    })
    
    // Check if it references the paragraph's topic
    const firstSentence = paragraph.sentences[0]?.text || ''
    const sharedWords = this.getSharedKeywords(text, firstSentence)
    if (sharedWords.length > 0) score += 0.1
    
    // Sentence length and structure
    if (text.split(/\s+/).length > 10) score += 0.1
    if (text.includes(',')) score += 0.05
    
    return Math.min(score, 1.0)
  }

  /**
   * Detect overall essay conclusion and analyze thesis restatement
   */
  detectOverallConclusionCandidates(structure, thesisText = '') {
    const candidates = []
    
    // Find conclusion paragraph
    const conclusionParagraph = structure.paragraphs.find(p => p.type === 'conclusion') || 
                               structure.paragraphs[structure.paragraphs.length - 1]
    
    if (conclusionParagraph && conclusionParagraph.sentences.length > 0) {
      conclusionParagraph.sentences.forEach((sentence, index) => {
        const conclusionScore = this.calculateOverallConclusionLikelihood(
          sentence.text, 
          index, 
          conclusionParagraph.sentences.length,
          thesisText
        )
        
        candidates.push({
          ...sentence,
          paragraphIndex: conclusionParagraph.index,
          sentenceIndex: index,
          confidence: conclusionScore,
          reason: index === 0 ? 'First sentence of conclusion paragraph' : 
                  index === conclusionParagraph.sentences.length - 1 ? 'Final sentence of essay' :
                  'Middle sentence of conclusion',
          type: 'overall_conclusion',
          analysis: {
            restatesThesis: thesisText ? this.checkThesisRestatement(sentence.text, thesisText) > 0.6 : false,
            summarizesMain: conclusionScore > 0.7,
            providesClosure: index === conclusionParagraph.sentences.length - 1,
            hasRecommendation: this.hasRecommendation(sentence.text)
          }
        })
      })
    }
    
    return candidates.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate overall conclusion likelihood
   */
  calculateOverallConclusionLikelihood(text, sentenceIndex, totalSentences, thesisText) {
    let score = 0.5 // Base score
    
    // Position bonus
    if (sentenceIndex === 0) score += 0.1 // First conclusion sentence
    if (sentenceIndex === totalSentences - 1) score += 0.2 // Final sentence
    
    // Conclusion indicators
    const conclusionIndicators = [
      /\b(in conclusion|to conclude|in summary|overall|finally)\b/i,
      /\b(therefore|thus|hence|consequently|as a result)\b/i,
      /\b(it is clear|clearly|obviously|evidently)\b/i,
      /\b(important|crucial|essential|necessary)\b/i
    ]
    
    conclusionIndicators.forEach(pattern => {
      if (pattern.test(text)) score += 0.15
    })
    
    // Check thesis restatement
    if (thesisText) {
      const restatementScore = this.checkThesisRestatement(text, thesisText)
      score += restatementScore * 0.3
    }
    
    // Future recommendations
    if (this.hasRecommendation(text)) score += 0.1
    
    return Math.min(score, 1.0)
  }

  /**
   * Check if conclusion restates thesis
   */
  checkThesisRestatement(conclusionText, thesisText) {
    const thesisKeywords = this.extractKeywords(thesisText)
    const conclusionKeywords = this.extractKeywords(conclusionText)
    
    const sharedKeywords = thesisKeywords.filter(keyword => 
      conclusionKeywords.includes(keyword)
    )
    
    // Return similarity ratio
    return thesisKeywords.length > 0 ? sharedKeywords.length / thesisKeywords.length : 0
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'that', 'this', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can']
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
  }

  /**
   * Get shared keywords between two texts
   */
  getSharedKeywords(text1, text2) {
    const keywords1 = this.extractKeywords(text1)
    const keywords2 = this.extractKeywords(text2)
    
    return keywords1.filter(keyword => keywords2.includes(keyword))
  }

  /**
   * Check if text has forward linking
   */
  hasForwardLink(text) {
    const forwardLinks = [
      /\b(next|following|furthermore|moreover|additionally)\b/i,
      /\b(this leads to|this suggests|this indicates)\b/i,
      /\b(moving forward|looking ahead|in the future)\b/i
    ]
    
    return forwardLinks.some(pattern => pattern.test(text))
  }

  /**
   * Check if text has recommendation
   */
  hasRecommendation(text) {
    const recommendationIndicators = [
      /\b(should|must|need to|ought to|recommend|suggest)\b/i,
      /\b(important to|necessary to|crucial to|essential to)\b/i,
      /\b(future|going forward|moving forward|in order to)\b/i
    ]
    
    return recommendationIndicators.some(pattern => pattern.test(text))
  }

  /**
   * Comprehensive structure analysis
   */
  analyzeStructure(essay) {
    const structure = this.parseEssayStructure(essay)
    const thesisCandidate = this.detectThesisCandidates(structure)[0]
    const thesisText = thesisCandidate?.text || ''
    
    return {
      ...structure,
      hookCandidates: this.detectHookCandidates(structure),
      thesisCandidates: this.detectThesisCandidates(structure),
      topicSentenceCandidates: this.detectTopicSentenceCandidates(structure),
      paragraphConclusionCandidates: this.detectParagraphConclusionCandidates(structure),
      overallConclusionCandidates: this.detectOverallConclusionCandidates(structure, thesisText),
      metadata: {
        paragraphCount: structure.paragraphs.length,
        sentenceCount: structure.sentences.length,
        averageWordsPerSentence: structure.wordCount / structure.sentences.length,
        hasIntroduction: structure.paragraphs.some(p => p.type === 'introduction'),
        hasConclusion: structure.paragraphs.some(p => p.type === 'conclusion'),
        hasBodyParagraphs: structure.paragraphs.some(p => p.type === 'body')
      }
    }
  }
}

module.exports = EssayStructureAnalyzer