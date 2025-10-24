import React, { useState } from 'react';
import { Bot, Plus } from 'lucide-react';
import GlassCard from '../../../components/UI/GlassCard';
import QuizCard from '../../../components/Quiz/QuizCard';
import QuizGenerator from '../../../components/Quiz/QuizGenerator';
import QuizPlayer from '../../../components/Quiz/QuizPlayer';
import QuizResults from '../../../components/Quiz/QuizResults';
import { quizApi } from '../../../lib/api';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics, variables, functions, and control structures',
      questions: 20,
      timeLimit: 30,
      difficulty: 'Beginner',
      score: 95,
      status: 'completed',
      attempts: 1,
      maxAttempts: 3
    },
    {
      id: 2,
      title: 'React Hooks Deep Dive',
      description: 'Advanced concepts about React hooks, custom hooks, and state management',
      questions: 15,
      timeLimit: 25,
      difficulty: 'Intermediate',
      score: null,
      status: 'available',
      attempts: 0,
      maxAttempts: 2
    },
    {
      id: 3,
      title: 'CSS Grid and Flexbox',
      description: 'Master modern CSS layout techniques with Grid and Flexbox',
      questions: 18,
      timeLimit: 20,
      difficulty: 'Beginner',
      score: 78,
      status: 'completed',
      attempts: 2,
      maxAttempts: 3
    },
    {
      id: 4,
      title: 'Node.js Backend Development',
      description: 'Server-side JavaScript, Express.js, and database integration',
      questions: 25,
      timeLimit: 45,
      difficulty: 'Advanced',
      score: null,
      status: 'locked',
      attempts: 0,
      maxAttempts: 2
    }
  ]);

  const [showGenerator, setShowGenerator] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'generator', 'quiz', 'results'

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'available': return 'text-blue-400 bg-blue-500/20';
      case 'locked': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleQuizGenerated = (quiz) => {
    // Add the new AI-generated quiz to the list
    const newQuiz = {
      ...quiz,
      id: Date.now(), // Temporary ID
      questions: quiz.questions.length,
      timeLimit: 15, // Default time limit for AI quizzes
      score: null,
      status: 'available',
      attempts: 0,
      maxAttempts: 3,
      ai_generated: true
    };
    
    setQuizzes(prev => [newQuiz, ...prev]);
    setCurrentQuiz(quiz);
    setView('quiz');
  };

  const handleQuizComplete = (score, result) => {
    setQuizResult(result);
    setView('results');
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    setView('quiz');
  };

  const handleCloseResults = () => {
    setQuizResult(null);
    setCurrentQuiz(null);
    setView('list');
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setView('quiz');
  };

  // Render different views
  if (view === 'generator') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setView('list')}
            className="text-gray-400 hover:text-white transition-colors mb-4"
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">AI Quiz Generator</h1>
          <p className="text-gray-300">Create personalized quizzes using AI</p>
        </div>
        <QuizGenerator onQuizGenerated={handleQuizGenerated} />
      </div>
    );
  }

  if (view === 'quiz' && currentQuiz) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setView('list')}
            className="text-gray-400 hover:text-white transition-colors mb-4"
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{currentQuiz.title}</h1>
          <p className="text-gray-300">{currentQuiz.description}</p>
        </div>
        <QuizPlayer quiz={currentQuiz} onComplete={handleQuizComplete} />
      </div>
    );
  }

  if (view === 'results' && quizResult) {
    return (
      <div className="max-w-6xl mx-auto">
        <QuizResults 
          result={quizResult} 
          onRetake={handleRetakeQuiz}
          onClose={handleCloseResults}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Quizzes</h1>
            <p className="text-gray-300">Test your knowledge and track your learning progress</p>
          </div>
          <button
            onClick={() => setView('generator')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <Bot className="w-5 h-5" />
            <span>Generate AI Quiz</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <GlassCard key={quiz.id} className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                  {quiz.ai_generated && (
                    <Bot className="w-4 h-4 text-purple-400" title="AI Generated" />
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quiz.status)}`}>
                  {quiz.status}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{quiz.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-400">Questions:</span>
                  <span className="text-white ml-2">{quiz.questions}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-white ml-2">{quiz.timeLimit} min</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Attempts:</span>
                  <span className="text-white ml-2">{quiz.attempts}/{quiz.maxAttempts}</span>
                </div>
              </div>
              
              {quiz.score && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Best Score</span>
                    <span>{quiz.score}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${quiz.score}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {quiz.status === 'available' && (
                <button 
                  onClick={() => handleStartQuiz(quiz)}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  Start Quiz
                </button>
              )}
              {quiz.status === 'completed' && (
                <>
                  <button 
                    onClick={() => handleStartQuiz(quiz)}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Retake Quiz
                  </button>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200">
                    View Results
                  </button>
                </>
              )}
              {quiz.status === 'locked' && (
                <button className="flex-1 py-2 px-4 bg-gray-500/20 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                  Complete Prerequisites
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Quizzes;
