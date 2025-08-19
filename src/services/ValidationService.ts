export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  metadata: ValidationMetadata
}

export interface ValidationError {
  type: ErrorType
  message: string
  field?: string
  severity: 'error' | 'warning' | 'info'
  code: string
}

export interface ValidationWarning {
  type: WarningType
  message: string
  suggestion?: string
  code: string
}

export interface ValidationMetadata {
  wordCount: number
  characterCount: number
  paragraphCount: number
  sentenceCount: number
  averageWordsPerSentence: number
  readabilityScore: number
  complexityLevel: 'basic' | 'intermediate' | 'advanced'
  estimatedBandScore: number
  timeToComplete?: number
}

export type ErrorType = 
  | 'length'
  | 'structure'
  | 'content'
  | 'format'
  | 'security'
  | 'language'
  | 'grammar'
  | 'vocabulary'

export type WarningType =
  | 'word_count'
  | 'paragraph_length'
  | 'sentence_complexity'
  | 'vocabulary_diversity'
  | 'coherence'
  | 'time_management'

export interface IELTSRequirements {
  task1: {
    minWords: 150
    maxWords: 200
    recommendedTime: 20 // minutes
    minParagraphs: 3
    maxParagraphs: 4
  }
  task2: {
    minWords: 250
    maxWords: 350
    recommendedTime: 40 // minutes
    minParagraphs: 4
    maxParagraphs: 5
  }
}

class ValidationService {
  private readonly requirements: IELTSRequirements = {
    task1: {
      minWords: 150,
      maxWords: 200,
      recommendedTime: 20,
      minParagraphs: 3,
      maxParagraphs: 4
    },
    task2: {
      minWords: 250,
      maxWords: 350,
      recommendedTime: 40,
      minParagraphs: 4,
      maxParagraphs: 5
    }
  }

  private debounceTimer: NodeJS.Timeout | null = null
  private validationCallbacks: Map<string, (result: ValidationResult) => void> = new Map()

  validateEssay(text: string, taskType: 'task1' | 'task2' = 'task2'): ValidationResult {
    const cleanText = this.sanitizeInput(text)
    const metadata = this.calculateMetadata(cleanText)
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const requirements = this.requirements[taskType]

    this.validateLength(cleanText, requirements, errors, warnings)
    this.validateStructure(cleanText, requirements, errors, warnings)
    this.validateContent(cleanText, errors, warnings)
    this.validateFormat(text, errors, warnings)
    this.validateSecurity(text, errors, warnings)
    this.validateLanguageQuality(cleanText, errors, warnings, metadata)

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      metadata: {
        ...metadata,
        estimatedBandScore: this.calculateBandScore(metadata, errors, warnings),
        timeToComplete: this.estimateTimeToComplete(metadata.wordCount, taskType)
      }
    }
  }

  validateRealTime(
    text: string, 
    taskType: 'task1' | 'task2' = 'task2',
    callbackId: string,
    callback: (result: ValidationResult) => void,
    debounceMs: number = 500
  ): void {
    this.validationCallbacks.set(callbackId, callback)

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      const result = this.validateEssay(text, taskType)
      const storedCallback = this.validationCallbacks.get(callbackId)
      if (storedCallback) {
        storedCallback(result)
      }
    }, debounceMs)
  }

  clearRealTimeValidation(callbackId: string): void {
    this.validationCallbacks.delete(callbackId)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  private sanitizeInput(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  private calculateMetadata(text: string): ValidationMetadata {
    const words = this.getWords(text)
    const sentences = this.getSentences(text)
    const paragraphs = this.getParagraphs(text)

    const wordCount = words.length
    const characterCount = text.length
    const paragraphCount = paragraphs.length
    const sentenceCount = sentences.length
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0

    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      averageWordsPerSentence,
      readabilityScore: this.calculateReadabilityScore(words, sentences),
      complexityLevel: this.determineComplexityLevel(words, sentences),
      estimatedBandScore: 0 // Will be calculated later
    }
  }

  private validateLength(
    text: string,
    requirements: IELTSRequirements['task1'] | IELTSRequirements['task2'],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const wordCount = this.getWords(text).length

    if (wordCount < requirements.minWords) {
      errors.push({
        type: 'length',
        message: `Essay is too short. Minimum ${requirements.minWords} words required, but only ${wordCount} words found.`,
        severity: 'error',
        code: 'MIN_WORDS_NOT_MET'
      })
    } else if (wordCount < requirements.minWords + 20) {
      warnings.push({
        type: 'word_count',
        message: `Essay is close to minimum length. Consider adding more content.`,
        suggestion: `Add ${requirements.minWords + 20 - wordCount} more words for a safer word count.`,
        code: 'WORD_COUNT_LOW'
      })
    }

    if (wordCount > requirements.maxWords + 50) {
      errors.push({
        type: 'length',
        message: `Essay is too long. Maximum recommended ${requirements.maxWords} words, but ${wordCount} words found.`,
        severity: 'warning',
        code: 'WORD_COUNT_HIGH'
      })
    } else if (wordCount > requirements.maxWords) {
      warnings.push({
        type: 'word_count',
        message: `Essay exceeds recommended length. Consider reducing content.`,
        suggestion: `Remove ${wordCount - requirements.maxWords} words to meet recommended length.`,
        code: 'WORD_COUNT_SLIGHTLY_HIGH'
      })
    }
  }

  private validateStructure(
    text: string,
    requirements: IELTSRequirements['task1'] | IELTSRequirements['task2'],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const paragraphs = this.getParagraphs(text)
    const paragraphCount = paragraphs.length

    if (paragraphCount < requirements.minParagraphs) {
      errors.push({
        type: 'structure',
        message: `Insufficient paragraphs. Minimum ${requirements.minParagraphs} paragraphs required.`,
        severity: 'error',
        code: 'INSUFFICIENT_PARAGRAPHS'
      })
    }

    if (paragraphCount > requirements.maxParagraphs) {
      warnings.push({
        type: 'paragraph_length',
        message: `Too many paragraphs. Consider consolidating ideas.`,
        suggestion: `Try to organize content into ${requirements.maxParagraphs} well-developed paragraphs.`,
        code: 'TOO_MANY_PARAGRAPHS'
      })
    }

    paragraphs.forEach((paragraph, index) => {
      const words = this.getWords(paragraph)
      if (words.length < 20) {
        warnings.push({
          type: 'paragraph_length',
          message: `Paragraph ${index + 1} is too short (${words.length} words).`,
          suggestion: 'Develop your ideas more fully in each paragraph.',
          code: 'SHORT_PARAGRAPH'
        })
      }

      if (words.length > 150) {
        warnings.push({
          type: 'paragraph_length',
          message: `Paragraph ${index + 1} is very long (${words.length} words).`,
          suggestion: 'Consider breaking this paragraph into smaller, more focused paragraphs.',
          code: 'LONG_PARAGRAPH'
        })
      }
    })
  }

  private validateContent(text: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const sentences = this.getSentences(text)
    const words = this.getWords(text)

    // Check for repetitive content
    const repeatedPhrases = this.findRepeatedPhrases(text)
    if (repeatedPhrases.length > 0) {
      warnings.push({
        type: 'vocabulary_diversity',
        message: 'Some phrases are repeated multiple times.',
        suggestion: 'Use synonyms and varied expressions to demonstrate vocabulary range.',
        code: 'REPETITIVE_PHRASES'
      })
    }

    // Check vocabulary diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    const vocabularyDiversity = uniqueWords.size / words.length
    
    if (vocabularyDiversity < 0.4) {
      warnings.push({
        type: 'vocabulary_diversity',
        message: 'Limited vocabulary range detected.',
        suggestion: 'Use more varied vocabulary to demonstrate language proficiency.',
        code: 'LOW_VOCABULARY_DIVERSITY'
      })
    }

    // Check sentence variety
    const sentenceLengths = sentences.map(s => this.getWords(s).length)
    const averageSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    
    if (averageSentenceLength < 8) {
      warnings.push({
        type: 'sentence_complexity',
        message: 'Sentences are quite short on average.',
        suggestion: 'Combine simple sentences and use more complex structures.',
        code: 'SHORT_SENTENCES'
      })
    }

    if (averageSentenceLength > 25) {
      warnings.push({
        type: 'sentence_complexity',
        message: 'Sentences are very long on average.',
        suggestion: 'Break down complex sentences for better clarity.',
        code: 'LONG_SENTENCES'
      })
    }
  }

  private validateFormat(originalText: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for HTML tags (indicates copy-paste issues)
    if (/<[^>]*>/.test(originalText)) {
      errors.push({
        type: 'format',
        message: 'HTML tags detected in the text.',
        severity: 'error',
        code: 'HTML_TAGS_FOUND'
      })
    }

    // Check for excessive special characters
    const specialCharCount = (originalText.match(/[^\w\s.,!?;:'"()-]/g) || []).length
    if (specialCharCount > originalText.length * 0.05) {
      warnings.push({
        type: 'word_count',
        message: 'Excessive special characters detected.',
        suggestion: 'Use standard punctuation and avoid special symbols.',
        code: 'EXCESSIVE_SPECIAL_CHARS'
      })
    }

    // Check for proper capitalization
    const sentences = this.getSentences(originalText)
    const uncapitalizedSentences = sentences.filter(s => {
      const firstChar = s.trim()[0]
      return firstChar && firstChar !== firstChar.toUpperCase()
    })

    if (uncapitalizedSentences.length > 0) {
      warnings.push({
        type: 'vocabulary_diversity',
        message: 'Some sentences do not start with capital letters.',
        suggestion: 'Ensure all sentences begin with capital letters.',
        code: 'CAPITALIZATION_ERRORS'
      })
    }
  }

  private validateSecurity(text: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for potential prompt injection
    const suspiciousPatterns = [
      /ignore\s+previous\s+instructions/i,
      /disregard\s+the\s+above/i,
      /pretend\s+you\s+are/i,
      /act\s+as\s+if/i,
      /new\s+instruction/i
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        errors.push({
          type: 'security',
          message: 'Potentially inappropriate content detected.',
          severity: 'error',
          code: 'SECURITY_VIOLATION'
        })
        break
      }
    }

    // Check for spam-like content
    const words = this.getWords(text)
    const wordFrequency = new Map<string, number>()
    
    words.forEach(word => {
      const normalized = word.toLowerCase()
      wordFrequency.set(normalized, (wordFrequency.get(normalized) || 0) + 1)
    })

    const maxFrequency = Math.max(...Array.from(wordFrequency.values()))
    if (maxFrequency > words.length * 0.1) {
      warnings.push({
        type: 'vocabulary_diversity',
        message: 'Repetitive content pattern detected.',
        suggestion: 'Ensure your essay contains meaningful, varied content.',
        code: 'SPAM_LIKE_CONTENT'
      })
    }
  }

  private validateLanguageQuality(
    text: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    metadata: ValidationMetadata
  ): void {
    // Basic grammar checks
    const sentences = this.getSentences(text)
    
    // Check for incomplete sentences
    const incompleteSentences = sentences.filter(s => {
      const words = this.getWords(s)
      return words.length < 3 || !s.trim().match(/[.!?]$/)
    })

    if (incompleteSentences.length > 0) {
      warnings.push({
        type: 'sentence_complexity',
        message: `${incompleteSentences.length} potentially incomplete sentence(s) found.`,
        suggestion: 'Ensure all sentences are complete with proper punctuation.',
        code: 'INCOMPLETE_SENTENCES'
      })
    }

    // Check coherence (basic transition word analysis)
    const transitionWords = [
      'however', 'therefore', 'furthermore', 'moreover', 'additionally',
      'consequently', 'nevertheless', 'meanwhile', 'subsequently'
    ]
    
    const hasTransitions = transitionWords.some(word => 
      text.toLowerCase().includes(word)
    )

    if (!hasTransitions && metadata.paragraphCount > 2) {
      warnings.push({
        type: 'coherence',
        message: 'Limited use of transition words detected.',
        suggestion: 'Use transition words to improve coherence between ideas.',
        code: 'LIMITED_TRANSITIONS'
      })
    }
  }

  private getWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }

  private getSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  private getParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }

  private findRepeatedPhrases(text: string): string[] {
    const words = this.getWords(text)
    const phrases = new Map<string, number>()
    
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ')
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1)
    }

    return Array.from(phrases.entries())
      .filter(([_, count]) => count > 1)
      .map(([phrase, _]) => phrase)
  }

  private calculateReadabilityScore(words: string[], sentences: string[]): number {
    if (sentences.length === 0) return 0
    
    const avgSentenceLength = words.length / sentences.length
    const complexWords = words.filter(word => word.length > 6).length
    const complexWordRatio = complexWords / words.length

    // Simplified Flesch Reading Ease calculation
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * complexWordRatio)
    return Math.max(0, Math.min(100, score))
  }

  private determineComplexityLevel(words: string[], sentences: string[]): 'basic' | 'intermediate' | 'advanced' {
    const avgSentenceLength = words.length / sentences.length
    const complexWords = words.filter(word => word.length > 8).length
    const complexWordRatio = complexWords / words.length

    if (avgSentenceLength > 20 && complexWordRatio > 0.3) {
      return 'advanced'
    } else if (avgSentenceLength > 15 && complexWordRatio > 0.2) {
      return 'intermediate'
    } else {
      return 'basic'
    }
  }

  private calculateBandScore(
    metadata: ValidationMetadata,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 6.0 // Start with band 6

    // Adjust based on errors
    const criticalErrors = errors.filter(e => e.severity === 'error').length
    score -= criticalErrors * 0.5

    // Adjust based on warnings
    const warningCount = warnings.length
    score -= warningCount * 0.1

    // Adjust based on complexity
    if (metadata.complexityLevel === 'advanced') score += 0.5
    else if (metadata.complexityLevel === 'basic') score -= 0.5

    // Adjust based on vocabulary diversity
    if (metadata.readabilityScore > 60) score += 0.3
    else if (metadata.readabilityScore < 30) score -= 0.3

    // Adjust based on sentence variety
    if (metadata.averageWordsPerSentence > 15 && metadata.averageWordsPerSentence < 25) {
      score += 0.2
    }

    return Math.max(1.0, Math.min(9.0, Math.round(score * 2) / 2))
  }

  private estimateTimeToComplete(wordCount: number, taskType: 'task1' | 'task2'): number {
    const targetWords = this.requirements[taskType].minWords
    const recommendedTime = this.requirements[taskType].recommendedTime
    
    if (wordCount >= targetWords) {
      return recommendedTime
    }
    
    const progress = wordCount / targetWords
    return Math.round(recommendedTime * progress)
  }

  // Public utility methods
  getWordCount(text: string): number {
    return this.getWords(this.sanitizeInput(text)).length
  }

  getCharacterCount(text: string): number {
    return text.length
  }

  getParagraphCount(text: string): number {
    return this.getParagraphs(text).length
  }

  getProgressIndicator(text: string, taskType: 'task1' | 'task2' = 'task2'): {
    wordProgress: number
    timeProgress: number
    structureProgress: number
  } {
    const cleanText = this.sanitizeInput(text)
    const wordCount = this.getWords(cleanText).length
    const paragraphCount = this.getParagraphs(text).length
    
    const requirements = this.requirements[taskType]
    
    return {
      wordProgress: Math.min(100, (wordCount / requirements.minWords) * 100),
      timeProgress: Math.min(100, (this.estimateTimeToComplete(wordCount, taskType) / requirements.recommendedTime) * 100),
      structureProgress: Math.min(100, (paragraphCount / requirements.minParagraphs) * 100)
    }
  }
}

export const validationService = new ValidationService()
export default ValidationService