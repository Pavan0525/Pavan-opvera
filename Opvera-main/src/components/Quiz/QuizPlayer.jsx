import React, { useState } from 'react';
import { quizAttemptApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const QuizPlayer = ({ quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Convert to seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const { user } = useAuth();

  // Use quiz data from props or fallback to mock data
  const questions = quiz.questions || [
    {
      id: 1,
      question: 'What is React?',
      options: [
        'A JavaScript library for building user interfaces',
        'A CSS framework',
        'A database management system',
        'A server-side framework'
      ],
      correctIndex: 0
    },
    {
      id: 2,
      question: 'Which hook is used to manage state in functional components?',
      options: [
        'useEffect',
        'useState',
        'useContext',
        'useReducer'
      ],
      correctIndex: 1
    },
    {
      id: 3,
      question: 'What does JSX stand for?',
      options: [
        'JavaScript XML',
        'JavaScript Extension',
        'JavaScript Syntax',
        'JavaScript Expression'
      ],
      correctIndex: 0
    }
  ];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = async () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed - submit with AI grading
      setSubmitting(true);
      try {
        const result = await quizAttemptApi.submitQuizWithGrading(
          quiz.id,
          user.id,
          newAnswers
        );
        
        setResult(result);
        onComplete(result.attempt.score, result);
      } catch (error) {
        console.error('Error submitting quiz:', error);
        // Fallback to basic scoring
        const score = calculateScore(newAnswers);
        onComplete(score);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const calculateScore = (userAnswers) => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="text-center text-gray-400">
        <p>No questions available for this quiz.</p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
          <div className="text-white font-medium">{formatTime(timeLeft)}</div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-6">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                selectedAnswer === index
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
              <span className="ml-2">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null || submitting}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : (currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next')}
        </button>
      </div>
    </div>
  );
};

export default QuizPlayer;
