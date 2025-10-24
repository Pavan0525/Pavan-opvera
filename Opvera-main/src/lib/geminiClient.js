import axios from 'axios'
import { supabase } from './supabaseClient.js'

const RATE_LIMIT_DELAY = 1000 // 1 second between requests
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

let lastRequestTime = 0

/**
 * Call Gemini API via Supabase Edge Function
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} opts - Additional options
 * @returns {Promise<Object>} - The response from Gemini API
 */
export async function callGemini(prompt, opts = {}) {
  // Rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  const requestBody = {
    prompt,
    temperature: opts.temperature || 0.7,
    topK: opts.topK || 40,
    topP: opts.topP || 0.95,
    maxOutputTokens: opts.maxOutputTokens || 1024,
  }

  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: requestBody
      })

      if (error) {
        throw new Error(`Edge function error: ${error.message}`)
      }

      if (data.text) {
        return {
          candidates: [{
            content: {
              parts: [{
                text: data.text
              }]
            }
          }]
        }
      } else {
        throw new Error('No valid response from Gemini API')
      }
    } catch (error) {
      retries++
      console.error(`Gemini API error (attempt ${retries}/${MAX_RETRIES}):`, error.message)
      
      if (retries >= MAX_RETRIES) {
        throw new Error(`Failed to get response from Gemini API after ${MAX_RETRIES} attempts: ${error.message}`)
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries - 1)))
    }
  }
}

/**
 * Generate a quiz based on topic and difficulty
 * @param {string} topic - The topic for the quiz
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 * @param {string} studentId - Student ID for context
 * @returns {Promise<Object>} - Generated quiz data
 */
export async function generateQuiz(topic, difficulty, studentId) {
  const prompt = `Generate 5 multiple-choice questions (JSON only) on the topic '${topic}' for a ${difficulty} student. Output format:
[
  {
    "q":"question text",
    "options":["A","B","C","D"],
    "correctIndex":1,
    "explanation":"brief explanation"
  },
  ...
]
Do not include extra text.`

  try {
    const response = await callGemini(prompt, { 
      temperature: 0.3,
      maxOutputTokens: 2048
    })
    
    const responseText = response.candidates[0].content.parts[0].text.trim()
    
    // Clean up the response to ensure it's valid JSON
    let cleanResponse = responseText
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '')
    }
    
    const quizData = JSON.parse(cleanResponse)
    
    // Validate the structure
    if (!Array.isArray(quizData) || quizData.length !== 5) {
      throw new Error('Invalid quiz format: expected array of 5 questions')
    }
    
    quizData.forEach((question, index) => {
      if (!question.q || !Array.isArray(question.options) || 
          question.options.length !== 4 || typeof question.correctIndex !== 'number' ||
          question.correctIndex < 0 || question.correctIndex > 3) {
        throw new Error(`Invalid question format at index ${index}`)
      }
    })
    
    // Transform to expected format
    const transformedQuestions = quizData.map(q => ({
      question: q.q,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation
    }))
    
    return {
      title: `${topic} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
      description: `Test your knowledge of ${topic} with these ${difficulty} level questions`,
      questions: transformedQuestions,
      difficulty,
      topic,
      created_by: studentId,
      ai_generated: true
    }
  } catch (error) {
    console.error('Error generating quiz:', error)
    throw new Error(`Failed to generate quiz: ${error.message}`)
  }
}

/**
 * Chat with AI using messages and session context
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} context - Context information (user role, skills, course, project)
 * @returns {Promise<string>} - AI response
 */
export async function chatAI(messages, context = {}) {
  const { role = 'student', skills = [], course, project } = context
  
  // Build conversation history
  const conversationHistory = messages.map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n')

  const systemPrompt = `You are Opvera AI assistant. Tone: friendly, helpful, concise. Provide step-by-step explanations and code blocks for code requests. If user asks for quizzes, return valid JSON only.`

  const prompt = `${systemPrompt}

Conversation History:
${conversationHistory}

Please provide a helpful response to the user's latest message.`

  try {
    const response = await callGemini(prompt, { 
      temperature: 0.7,
      maxOutputTokens: 1024
    })
    return response.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Error in AI chat:', error)
    throw new Error(`Failed to get AI response: ${error.message}`)
  }
}

/**
 * Grade quiz answers using AI
 * @param {Array} userAnswers - Array of user's answers
 * @param {Object} quiz - Quiz object with questions and correct answers
 * @returns {Promise<Object>} - Grading result with score and detailed feedback
 */
export async function gradeQuizAnswers(userAnswers, quiz) {
  const prompt = `Grade these quiz answers for a student. Provide detailed feedback and suggestions.

Quiz: ${quiz.title}
Topic: ${quiz.topic || 'General'}

Questions and Answers:
${quiz.questions.map((q, index) => `
Question ${index + 1}: ${q.question}
Correct Answer: ${q.options[q.correctIndex]}
Student Answer: ${userAnswers[index] !== undefined ? q.options[userAnswers[index]] : 'No answer provided'}
Explanation: ${q.explanation}
`).join('\n')}

IMPORTANT: Respond with ONLY valid JSON in this exact format:
{
  "overallScore": 85,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "detailedFeedback": [
    {
      "questionIndex": 0,
      "correct": true,
      "score": 20,
      "feedback": "Great job! You correctly identified...",
      "suggestion": "Consider reviewing..."
    }
  ],
  "generalFeedback": "Overall performance feedback and encouragement",
  "improvementAreas": ["Area 1", "Area 2"],
  "strengths": ["Strength 1", "Strength 2"]
}

Make sure:
- overallScore is 0-100
- Each detailedFeedback item has correct (boolean), score (0-20), feedback, and suggestion
- Be encouraging and constructive
- Provide specific learning suggestions`

  try {
    const response = await callGemini(prompt, { 
      temperature: 0.2,
      maxOutputTokens: 2048
    })
    
    const responseText = response.candidates[0].content.parts[0].text.trim()
    
    // Clean up the response to ensure it's valid JSON
    let cleanResponse = responseText
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '')
    }
    
    const gradingResult = JSON.parse(cleanResponse)
    
    // Validate the structure
    if (typeof gradingResult.overallScore !== 'number' || 
        !Array.isArray(gradingResult.detailedFeedback) ||
        typeof gradingResult.generalFeedback !== 'string') {
      throw new Error('Invalid grading result format')
    }
    
    return gradingResult
  } catch (error) {
    console.error('Error grading quiz:', error)
    throw new Error(`Failed to grade quiz: ${error.message}`)
  }
}

/**
 * Grade a single answer with AI feedback
 * @param {string} question - The question text
 * @param {number} correctIndex - Index of correct answer
 * @param {number} studentAnswer - Student's answer index
 * @returns {Promise<Object>} - Grading result with score and feedback
 */
export async function gradeSingleAnswer(question, correctIndex, studentAnswer) {
  const prompt = `Given the question: ${question}, correct answer index ${correctIndex}, student's answer ${studentAnswer}. Return JSON: {"correct":true/false, "score":1 or 0, "explanation":"short"}.`

  try {
    const response = await callGemini(prompt, { 
      temperature: 0.3,
      maxOutputTokens: 512
    })
    
    const responseText = response.candidates[0].content.parts[0].text.trim()
    
    // Clean up the response to ensure it's valid JSON
    let cleanResponse = responseText
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '')
    }
    
    return JSON.parse(cleanResponse)
  } catch (error) {
    console.error('Error grading single answer:', error)
    throw new Error(`Failed to grade answer: ${error.message}`)
  }
}