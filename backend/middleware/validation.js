/**
 * =============================================================================
 * VALIDATION MIDDLEWARE
 * =============================================================================
 * 
 * Input validation and sanitization middleware for security and data integrity.
 */

const { AppError } = require('./errorHandler')

/**
 * Sanitize request body to prevent XSS and injection attacks
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    // Recursively sanitize object properties
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'string') {
            // Basic XSS prevention - remove script tags and javascript: protocols
            obj[key] = obj[key]
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key])
          }
        }
      }
    }
    
    sanitizeObject(req.body)
  }
  
  next()
}

/**
 * Validate chat session ID format
 */
const validateChatId = (req, res, next) => {
  const { chatId } = req.params
  
  if (!chatId) {
    return next(new AppError('Chat ID is required', 400, 'MISSING_CHAT_ID'))
  }
  
  // Basic format validation - should be alphanumeric with dashes/underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(chatId)) {
    return next(new AppError('Invalid chat ID format', 400, 'INVALID_CHAT_ID'))
  }
  
  if (chatId.length > 100) {
    return next(new AppError('Chat ID too long', 400, 'CHAT_ID_TOO_LONG'))
  }
  
  next()
}

/**
 * Validate essay content
 */
const validateEssay = (req, res, next) => {
  const { essay, prompt } = req.body
  
  if (!essay) {
    return next(new AppError('Essay content is required', 400, 'MISSING_ESSAY'))
  }
  
  if (!prompt) {
    return next(new AppError('Essay prompt is required', 400, 'MISSING_PROMPT'))
  }
  
  if (typeof essay !== 'string' || typeof prompt !== 'string') {
    return next(new AppError('Essay and prompt must be strings', 400, 'INVALID_DATA_TYPE'))
  }
  
  if (essay.length > 50000) {
    return next(new AppError('Essay too long (max 50,000 characters)', 400, 'ESSAY_TOO_LONG'))
  }
  
  if (prompt.length > 5000) {
    return next(new AppError('Prompt too long (max 5,000 characters)', 400, 'PROMPT_TOO_LONG'))
  }
  
  next()
}

/**
 * Validate chat message
 */
const validateChatMessage = (req, res, next) => {
  const { message } = req.body
  
  if (!message) {
    return next(new AppError('Message is required', 400, 'MISSING_MESSAGE'))
  }
  
  if (typeof message !== 'string') {
    return next(new AppError('Message must be a string', 400, 'INVALID_MESSAGE_TYPE'))
  }
  
  if (message.length > 10000) {
    return next(new AppError('Message too long (max 10,000 characters)', 400, 'MESSAGE_TOO_LONG'))
  }
  
  if (message.trim().length === 0) {
    return next(new AppError('Message cannot be empty', 400, 'EMPTY_MESSAGE'))
  }
  
  next()
}

module.exports = {
  sanitizeRequest,
  validateChatId,
  validateEssay,
  validateChatMessage
}