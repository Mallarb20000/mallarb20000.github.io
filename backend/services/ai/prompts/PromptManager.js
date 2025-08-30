/**
 * =============================================================================
 * ADVANCED PROMPT MANAGEMENT SYSTEM
 * =============================================================================
 * 
 * Provides prompt versioning, A/B testing, and optimization capabilities.
 * Allows for systematic prompt improvement and testing.
 */

const IELTSPrompts = require('./IELTSPrompts')

class PromptManager {
  constructor(config = {}) {
    this.currentVersion = config.version || '2.0'
    this.enableABTesting = config.enableABTesting || false
    this.testVariant = config.testVariant || 'A'
    
    this.promptProviders = {
      'ielts': new IELTSPrompts()
    }
    
    this.statistics = {
      promptsGenerated: 0,
      variantUsage: { A: 0, B: 0 },
      performanceMetrics: {}
    }
  }

  /**
   * Generate prompt with automatic A/B testing
   */
  generatePrompt(type, data, options = {}) {
    const variant = this.selectVariant(options.forceVariant)
    const provider = this.promptProviders[options.domain || 'ielts']
    
    let prompt
    
    switch (type) {
      case 'single':
        prompt = provider.generateSingleQuestionPrompt(data.question, data.testType)
        break
      case 'multi':
        prompt = provider.generateMultiQuestionPrompt(data.questions, data.testType)
        break
      default:
        throw new Error(`Unknown prompt type: ${type}`)
    }
    
    // Apply variant modifications if A/B testing enabled
    if (this.enableABTesting && variant === 'B') {
      prompt = this.applyVariantB(prompt, type)
    }
    
    this.trackUsage(variant, type)
    return prompt
  }

  /**
   * Select A/B testing variant
   */
  selectVariant(forceVariant) {
    if (forceVariant) return forceVariant
    if (!this.enableABTesting) return 'A'
    
    // 50/50 split for A/B testing
    return Math.random() < 0.5 ? 'A' : 'B'
  }

  /**
   * Apply variant B modifications (for A/B testing)
   */
  applyVariantB(prompt, type) {
    // Example variant modifications:
    // - More specific instructions
    // - Different response format requirements
    // - Additional context or examples
    
    const variantBModifications = {
      single: {
        addition: '\n\nADDITIONAL INSTRUCTION: Provide specific examples from the audio in your feedback.',
        replacement: {}
      },
      multi: {
        addition: '\n\nADDITIONAL INSTRUCTION: Compare performance across questions and note progression patterns.',
        replacement: {}
      }
    }
    
    const mod = variantBModifications[type]
    if (mod) {
      let modifiedPrompt = prompt + mod.addition
      
      // Apply any string replacements
      for (const [search, replace] of Object.entries(mod.replacement)) {
        modifiedPrompt = modifiedPrompt.replace(search, replace)
      }
      
      return modifiedPrompt
    }
    
    return prompt
  }

  /**
   * Track prompt usage for analytics
   */
  trackUsage(variant, type) {
    this.statistics.promptsGenerated++
    this.statistics.variantUsage[variant]++
    
    const key = `${variant}_${type}`
    if (!this.statistics.performanceMetrics[key]) {
      this.statistics.performanceMetrics[key] = {
        count: 0,
        avgResponseTime: 0,
        avgAccuracy: 0
      }
    }
    this.statistics.performanceMetrics[key].count++
  }

  /**
   * Record performance metrics for prompt optimization
   */
  recordPerformance(variant, type, metrics) {
    const key = `${variant}_${type}`
    const stats = this.statistics.performanceMetrics[key]
    
    if (stats) {
      // Update moving averages
      const count = stats.count
      stats.avgResponseTime = ((stats.avgResponseTime * (count - 1)) + metrics.responseTime) / count
      stats.avgAccuracy = ((stats.avgAccuracy * (count - 1)) + metrics.accuracy) / count
    }
  }

  /**
   * Get A/B testing results and statistics
   */
  getAnalytics() {
    return {
      version: this.currentVersion,
      totalPrompts: this.statistics.promptsGenerated,
      variantDistribution: this.statistics.variantUsage,
      performanceMetrics: this.statistics.performanceMetrics,
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * Generate optimization recommendations based on data
   */
  generateRecommendations() {
    const recommendations = []
    const metrics = this.statistics.performanceMetrics
    
    // Compare variant performance
    const variantA = Object.keys(metrics).filter(k => k.startsWith('A_'))
    const variantB = Object.keys(metrics).filter(k => k.startsWith('B_'))
    
    if (variantA.length > 0 && variantB.length > 0) {
      const avgAccuracyA = variantA.reduce((sum, key) => sum + metrics[key].avgAccuracy, 0) / variantA.length
      const avgAccuracyB = variantB.reduce((sum, key) => sum + metrics[key].avgAccuracy, 0) / variantB.length
      
      if (avgAccuracyB > avgAccuracyA * 1.05) {
        recommendations.push('Variant B shows 5%+ improvement in accuracy. Consider promoting to primary.')
      }
      
      const avgTimeA = variantA.reduce((sum, key) => sum + metrics[key].avgResponseTime, 0) / variantA.length
      const avgTimeB = variantB.reduce((sum, key) => sum + metrics[key].avgResponseTime, 0) / variantB.length
      
      if (avgTimeA > avgTimeB * 1.1) {
        recommendations.push('Variant B is 10%+ faster. Consider optimizing Variant A prompts.')
      }
    }
    
    return recommendations
  }

  /**
   * Export prompt templates for external editing
   */
  exportTemplates() {
    return {
      version: this.currentVersion,
      templates: {
        single: this.promptProviders.ielts.generateSingleQuestionPrompt('[QUESTION]', '[TEST_TYPE]'),
        multi: this.promptProviders.ielts.generateMultiQuestionPrompt(['[QUESTION_1]', '[QUESTION_2]'], '[TEST_TYPE]')
      },
      metadata: {
        exportDate: new Date().toISOString(),
        statistics: this.getAnalytics()
      }
    }
  }

  /**
   * Import optimized prompt templates
   */
  importTemplates(templates) {
    // Implementation for importing externally optimized prompts
    // Useful for incorporating human-optimized or ML-optimized prompts
    console.log('Template import functionality - implement based on needs')
    return { success: true, imported: Object.keys(templates).length }
  }
}

module.exports = PromptManager