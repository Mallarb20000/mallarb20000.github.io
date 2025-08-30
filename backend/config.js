/**
 * =============================================================================
 * WRITING BACKEND CONFIGURATION
 * =============================================================================
 * 
 * Minimal configuration for writing functionality only.
 */

require('dotenv').config()

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // AI Service Configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.AI_MODEL || 'gemini-2.0-flash-exp',
    maxRetries: parseInt(process.env.AI_MAX_RETRIES) || 3,
    timeout: parseInt(process.env.AI_TIMEOUT) || 30000
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
}

// Validation
const validateConfig = () => {
  const errors = []

  if (!config.ai.apiKey) {
    errors.push('GEMINI_API_KEY is required')
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:')
    errors.forEach(error => console.error(`  - ${error}`))
    process.exit(1)
  }
}

// Run validation
validateConfig()

module.exports = config