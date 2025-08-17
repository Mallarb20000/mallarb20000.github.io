const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export interface Question {
  id: number
  question: string
  category?: string
  type?: string
}

export interface QuestionsResponse {
  success: boolean
  questions?: Question[]
  question?: Question
  total?: number
  metadata?: {
    totalQuestions: number
    categories: string[]
    questionTypes: string[]
    categoryStats?: Record<string, number>
    typeStats?: Record<string, number>
  }
}

class QuestionsAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async getRandomQuestion(options?: {
    category?: string
    type?: string
  }): Promise<Question> {
    try {
      const params = new URLSearchParams()
      if (options?.category) params.append('category', options.category)
      if (options?.type) params.append('type', options.type)
      
      const url = `${this.baseUrl}/api/writing/questions/random${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionsResponse = await response.json()
      
      if (!data.success || !data.question) {
        throw new Error('Invalid response format')
      }
      
      return data.question
    } catch (error) {
      console.error('Error fetching random question:', error)
      // Fallback question
      return {
        id: 1,
        question: "Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both views and give your own opinion.",
        category: "Education",
        type: "discuss_both_views"
      }
    }
  }

  async getQuestionsByCategory(category: string, options?: {
    type?: string
    limit?: number
  }): Promise<Question[]> {
    try {
      const params = new URLSearchParams()
      if (options?.type) params.append('type', options.type)
      if (options?.limit) params.append('limit', options.limit.toString())
      
      const url = `${this.baseUrl}/api/writing/questions/category/${category}${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionsResponse = await response.json()
      
      if (!data.success || !data.questions) {
        throw new Error('Invalid response format')
      }
      
      return data.questions
    } catch (error) {
      console.error('Error fetching questions by category:', error)
      return []
    }
  }

  async getAllQuestions(options?: {
    category?: string
    type?: string
    limit?: number
  }): Promise<Question[]> {
    try {
      const params = new URLSearchParams()
      if (options?.category) params.append('category', options.category)
      if (options?.type) params.append('type', options.type)
      if (options?.limit) params.append('limit', options.limit.toString())
      
      const url = `${this.baseUrl}/api/writing/questions${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionsResponse = await response.json()
      
      if (!data.success || !data.questions) {
        throw new Error('Invalid response format')
      }
      
      return data.questions
    } catch (error) {
      console.error('Error fetching all questions:', error)
      return []
    }
  }

  async getMetadata(): Promise<QuestionsResponse['metadata'] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/writing/questions/metadata`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionsResponse = await response.json()
      
      if (!data.success) {
        throw new Error('Invalid response format')
      }
      
      return data.metadata || null
    } catch (error) {
      console.error('Error fetching metadata:', error)
      return null
    }
  }
}

export const questionsAPI = new QuestionsAPI()

export const getRandomQuestion = (options?: { category?: string; type?: string }) => 
  questionsAPI.getRandomQuestion(options)

export const getQuestionsByCategory = (category: string, options?: { type?: string; limit?: number }) => 
  questionsAPI.getQuestionsByCategory(category, options)

export const getAllQuestions = (options?: { category?: string; type?: string; limit?: number }) => 
  questionsAPI.getAllQuestions(options)

export const getQuestionsMetadata = () => 
  questionsAPI.getMetadata()