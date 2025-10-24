import { supabase } from './supabaseClient'

// User Management
export const userApi = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Create user profile
  async createUserProfile(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Quiz Management
export const quizApi = {
  // Get all quizzes
  async getQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get quiz by ID
  async getQuizById(quizId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()
    
    if (error) throw error
    return data
  },

  // Create quiz
  async createQuiz(quizData) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Generate quiz using AI
  async generateQuiz(topic, difficulty, studentId) {
    // Import here to avoid circular dependency
    const { generateQuiz: generateQuizAI } = await import('./geminiClient')
    
    try {
      const quizData = await generateQuizAI(topic, difficulty, studentId)
      
      // Save to database
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          description: quizData.description,
          questions: quizData.questions,
          difficulty: quizData.difficulty,
          topic: quizData.topic,
          created_by: quizData.created_by,
          ai_generated: quizData.ai_generated,
          metadata: {
            ai_model: 'gemini',
            generation_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error generating quiz:', error)
      throw error
    }
  },

  // Update quiz
  async updateQuiz(quizId, updates) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete quiz
  async deleteQuiz(quizId) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
    
    if (error) throw error
  }
}

// Quiz Attempts
export const quizAttemptApi = {
  // Get user's quiz attempts
  async getUserAttempts(userId) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create quiz attempt
  async createAttempt(attemptData) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attemptData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Submit quiz with AI grading
  async submitQuizWithGrading(quizId, studentId, answers) {
    // Import here to avoid circular dependency
    const { gradeQuizAnswers } = await import('./geminiClient')
    
    try {
      // Get quiz data
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
      
      if (quizError) throw quizError
      
      // Calculate basic score
      let correctAnswers = 0
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctIndex) {
          correctAnswers++
        }
      })
      
      const basicScore = Math.round((correctAnswers / quiz.questions.length) * 100)
      
      // Get AI grading
      let aiGrading = null
      try {
        aiGrading = await gradeQuizAnswers(answers, quiz)
      } catch (aiError) {
        console.warn('AI grading failed, using basic score:', aiError.message)
      }
      
      // Create quiz attempt
      const attemptData = {
        quiz_id: quizId,
        student_id: studentId,
        answers: answers,
        score: aiGrading ? aiGrading.overallScore : basicScore,
        max_score: 100,
        completed_at: new Date().toISOString(),
        metadata: {
          ai_graded: !!aiGrading,
          ai_feedback: aiGrading,
          basic_score: basicScore,
          correct_answers: correctAnswers,
          total_questions: quiz.questions.length
        }
      }
      
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert(attemptData)
        .select()
        .single()
      
      if (attemptError) throw attemptError
      
      // Update leaderboard (this will be handled by the trigger)
      // The trigger will automatically update the leaderboard based on the score
      
      return {
        attempt,
        aiGrading,
        basicScore,
        correctAnswers,
        totalQuestions: quiz.questions.length
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      throw error
    }
  },

  // Update attempt score
  async updateAttemptScore(attemptId, score) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .update({ score, completed_at: new Date().toISOString() })
      .eq('id', attemptId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Chat Management
export const chatApi = {
  // Get user's chats
  async getUserChats(userId) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        participants:chat_participants (
          user_id,
          profiles (username, avatar_url)
        )
      `)
      .eq('participants.user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create chat
  async createChat(chatData) {
    const { data, error } = await supabase
      .from('chats')
      .insert(chatData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get chat messages
  async getChatMessages(chatId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Send message
  async sendMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Send AI message (for student AI chat)
  async sendAIMessage(channelId, senderId, content, context = {}) {
    // Import here to avoid circular dependency
    const { chatAI } = await import('./geminiClient')
    
    try {
      // Get recent messages for context
      const { data: recentMessages, error: messagesError } = await supabase
        .from('messages')
        .select('content, metadata')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (messagesError) throw messagesError
      
      // Prepare messages for AI
      const messages = [
        ...recentMessages.reverse().map(msg => ({
          role: msg.metadata?.ai ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content }
      ]
      
      // Get AI response
      const aiResponse = await chatAI(messages, context)
      
      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          sender_id: senderId,
          content,
          metadata: { ai_request: true }
        })
        .select()
        .single()
      
      if (userError) throw userError
      
      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          sender_id: senderId, // AI messages use the same sender_id for threading
          content: aiResponse,
          metadata: { 
            ai: true, 
            model: 'gemini',
            context: context
          }
        })
        .select()
        .single()
      
      if (aiError) throw aiError
      
      return { userMessage, aiMessage }
    } catch (error) {
      console.error('Error sending AI message:', error)
      throw error
    }
  },

  // Search messages
  async searchMessages(query) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users!messages_sender_id_fkey (
          display_name,
          email,
          role
        ),
        channels!messages_channel_id_fkey (
          name,
          type
        )
      `)
      .ilike('content', `%${query}%`)
      .limit(20)
    
    if (error) throw error
    return data || []
  },

  // Log mentor action
  async logMentorAction(actionData) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id: actionData.mentor_id,
        action: actionData.action,
        target_type: actionData.target_type || 'message',
        target_id: actionData.target_id,
        details: actionData.details
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete message
  async deleteMessage(messageId) {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Leaderboard
export const leaderboardApi = {
  // Get leaderboard data with user details
  async getLeaderboard(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        user_id,
        total_points,
        breakdown,
        rank,
        updated_at,
        users!inner (
          display_name,
          avatar_url,
          skills,
          role
        )
      `)
      .eq('users.role', 'student')
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get leaderboard with skill filtering
  async getLeaderboardBySkill(skill, limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        user_id,
        total_points,
        breakdown,
        rank,
        updated_at,
        users!inner (
          display_name,
          avatar_url,
          skills,
          role
        )
      `)
      .eq('users.role', 'student')
      .contains('users.skills', [skill])
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get current user's leaderboard position
  async getUserRank(userId) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        user_id,
        total_points,
        breakdown,
        rank,
        updated_at,
        users!inner (
          display_name,
          avatar_url,
          skills
        )
      `)
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Search leaderboard by name
  async searchLeaderboard(query, limit = 50) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        user_id,
        total_points,
        breakdown,
        rank,
        updated_at,
        users!inner (
          display_name,
          avatar_url,
          skills,
          role
        )
      `)
      .eq('users.role', 'student')
      .ilike('users.display_name', `%${query}%`)
      .order('rank', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Refresh leaderboard for a specific user (admin function)
  async refreshUserLeaderboard(userId) {
    const { error } = await supabase.rpc('refresh_user_leaderboard', {
      user_id: userId
    })
    
    if (error) throw error
  },

  // Refresh all leaderboard entries (admin function)
  async refreshAllLeaderboard() {
    const { error } = await supabase.rpc('refresh_all_leaderboard')
    
    if (error) throw error
  }
}

// Projects
export const projectApi = {
  // Get user projects
  async getUserProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get all projects (for mentors/admins)
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_owner_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create project
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update project
  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Verify project (mentor function)
  async verifyProject(projectId, verified = true) {
    const { data, error } = await supabase
      .from('projects')
      .update({ verified })
      .eq('id', projectId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Search projects
  async searchProjects(query) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_owner_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20)
    
    if (error) throw error
    return data || []
  }
}

// Assignments
export const assignmentApi = {
  // Get user assignments
  async getUserAssignments(userId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get all assignments (for mentors/admins)
  async getAllAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        users!assignments_student_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create assignment
  async createAssignment(assignmentData) {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignmentData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Submit assignment
  async submitAssignment(assignmentId, submissionUrl) {
    const { data, error } = await supabase
      .from('assignments')
      .update({ 
        submission_url: submissionUrl,
        points: 20 // Award 20 points for submission
      })
      .eq('id', assignmentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Verify assignment (mentor function)
  async verifyAssignment(assignmentId, verified = true, mentorNotes = '') {
    const { data, error } = await supabase
      .from('assignments')
      .update({ 
        verified,
        mentor_notes: mentorNotes
      })
      .eq('id', assignmentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Search assignments
  async searchAssignments(query) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        users!assignments_student_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%,mentor_notes.ilike.%${query}%`)
      .limit(20)
    
    if (error) throw error
    return data || []
  }
}

// Admin functions
export const adminApi = {
  // Get all users
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Search users
  async searchUsers(query) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20)
    
    if (error) throw error
    return data || []
  },

  // Ban user
  async banUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'banned' })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Kick user from channel
  async kickUserFromChannel(userId, channelId) {
    // Get channel members and remove user
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('members')
      .eq('id', channelId)
      .single()
    
    if (channelError) throw channelError
    
    const updatedMembers = channel.members.filter(member => member !== userId.toString())
    
    const { data, error } = await supabase
      .from('channels')
      .update({ members: updatedMembers })
      .eq('id', channelId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete message
  async deleteMessage(messageId) {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete channel
  async deleteChannel(channelId) {
    const { data, error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get system statistics
  async getSystemStats() {
    const { data, error } = await supabase
      .from('users')
      .select('id')
    
    if (error) throw error
    
    const userCount = data.length
    
    // Get additional stats
    const [quizzesResult, projectsResult] = await Promise.all([
      supabase.from('quizzes').select('id'),
      supabase.from('projects').select('id')
    ])
    
    return {
      totalUsers: userCount,
      totalQuizzes: quizzesResult.data?.length || 0,
      totalProjects: projectsResult.data?.length || 0
    }
  }
}