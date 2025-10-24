import React from 'react';

const QuizCard = ({ quiz, onStartQuiz, onViewResults }) => {
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

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
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
            onClick={() => onStartQuiz(quiz.id)}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
          >
            Start Quiz
          </button>
        )}
        {quiz.status === 'completed' && (
          <>
            <button 
              onClick={() => onStartQuiz(quiz.id)}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200"
            >
              Retake Quiz
            </button>
            <button 
              onClick={() => onViewResults(quiz.id)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
            >
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
    </div>
  );
};

export default QuizCard;
