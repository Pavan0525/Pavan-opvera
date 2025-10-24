import React, { useState } from 'react';
import { Bot, Loader, CheckCircle } from 'lucide-react';
import { quizApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const QuizGenerator = ({ onQuizGenerated }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const difficulties = [
    { value: 'beginner', label: 'Beginner', description: 'Basic concepts and fundamentals' },
    { value: 'intermediate', label: 'Intermediate', description: 'Moderate complexity and application' },
    { value: 'advanced', label: 'Advanced', description: 'Complex topics and deep understanding' }
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const quiz = await quizApi.generateQuiz(topic.trim(), difficulty, user.id);
      onQuizGenerated(quiz);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Quiz Generator</h2>
            <p className="text-gray-400 text-sm">Generate personalized quizzes using AI</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-white mb-2">
              Quiz Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks, JavaScript ES6, CSS Grid..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={generating}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => setDifficulty(diff.value)}
                  disabled={generating}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    difficulty === diff.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-medium">{diff.label}</div>
                  <div className="text-xs opacity-75 mt-1">{diff.description}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={generating || !topic.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {generating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-300 font-medium text-sm">AI-Powered Features</h4>
              <ul className="text-blue-200 text-xs mt-1 space-y-1">
                <li>• Generates 5 multiple-choice questions tailored to your skill level</li>
                <li>• Provides detailed explanations for each answer</li>
                <li>• Includes AI-powered grading with personalized feedback</li>
                <li>• Automatically updates your leaderboard score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
