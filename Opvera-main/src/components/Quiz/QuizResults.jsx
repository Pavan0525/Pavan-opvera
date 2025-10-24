import React from 'react';
import { CheckCircle, XCircle, Star, TrendingUp, BookOpen, Lightbulb } from 'lucide-react';

const QuizResults = ({ result, onRetake, onClose }) => {
  const { attempt, aiGrading, basicScore, correctAnswers, totalQuestions } = result;
  const score = attempt.score;
  const percentage = Math.round(score);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent work!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good effort!';
    if (score >= 60) return 'Not bad, keep practicing!';
    return 'Keep studying and try again!';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
            {percentage}%
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {getScoreMessage(score)}
          </h2>
          <p className="text-gray-400">
            You got {correctAnswers} out of {totalQuestions} questions correct
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{correctAnswers}</div>
            <div className="text-gray-400 text-sm">Correct Answers</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalQuestions - correctAnswers}</div>
            <div className="text-gray-400 text-sm">Incorrect Answers</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{percentage}%</div>
            <div className="text-gray-400 text-sm">Final Score</div>
          </div>
        </div>

        {/* AI Feedback */}
        {aiGrading && (
          <div className="space-y-6">
            {/* General Feedback */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-300 font-semibold mb-2">AI Feedback</h3>
                  <p className="text-blue-100">{aiGrading.generalFeedback}</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {aiGrading.strengths && aiGrading.strengths.length > 0 && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-green-300 font-semibold mb-2">Your Strengths</h3>
                    <ul className="text-green-100 space-y-1">
                      {aiGrading.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {aiGrading.improvementAreas && aiGrading.improvementAreas.length > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-yellow-300 font-semibold mb-2">Areas to Focus On</h3>
                    <ul className="text-yellow-100 space-y-1">
                      {aiGrading.improvementAreas.map((area, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Question Feedback */}
            {aiGrading.detailedFeedback && aiGrading.detailedFeedback.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Question-by-Question Feedback</h3>
                {aiGrading.detailedFeedback.map((feedback, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${
                      feedback.correct
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {feedback.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-white font-medium">
                            Question {feedback.questionIndex + 1}
                          </span>
                          <span className={`text-sm font-medium ${
                            feedback.correct ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {feedback.score}/20 points
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${
                          feedback.correct ? 'text-green-100' : 'text-red-100'
                        }`}>
                          {feedback.feedback}
                        </p>
                        {feedback.suggestion && (
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-yellow-100 text-sm">{feedback.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
          >
            Retake Quiz
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
