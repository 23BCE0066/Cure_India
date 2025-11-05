import { Clock, Brain } from 'lucide-react';
import { QuizQuestion } from '@/data/quizQuestions';

interface QuizQuestionProps {
  question: QuizQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  score: number;
  streak: number;
}

export default function QuizQuestion({
  question,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  selectedAnswer,
  onAnswerSelect,
  score,
  streak
}: QuizQuestionProps) {
  const getTimerColor = () => {
    if (timeRemaining > 20) return 'text-accent-primary';
    if (timeRemaining > 10) return 'text-warning';
    return 'text-emergency';
  };

  const getTimerBackground = () => {
    if (timeRemaining > 20) return 'bg-accent-primary/20';
    if (timeRemaining > 10) return 'bg-warning/20';
    return 'bg-emergency/20';
  };

  const getButtonStyle = (index: number) => {
    if (selectedAnswer === null) {
      return 'bg-background-tertiary hover:bg-background-tertiary/80 border-border-primary text-text-primary';
    }

    if (index === question.correctAnswer) {
      return 'bg-emergency/20 border-emergency text-emergency';
    }

    if (index === selectedAnswer && index !== question.correctAnswer) {
      return 'bg-accent-primary/20 border-accent-primary text-accent-primary';
    }

    return 'bg-background-tertiary/50 border-border-primary/50 text-text-muted';
  };

  const getPercentage = () => {
    return (timeRemaining / 30) * 100;
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-text-muted">Question</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentQuestionIndex + 1}/{totalQuestions}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-muted">Score</p>
              <p className="text-2xl font-bold text-accent-primary">{score}</p>
            </div>
            {streak >= 3 && (
              <div className="text-center animate-pulse">
                <p className="text-sm text-text-muted">Streak</p>
                <p className="text-2xl font-bold text-warning">🔥 {streak}</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className={`relative w-16 h-16 rounded-full ${getTimerBackground()} flex items-center justify-center`}>
            <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-background-tertiary"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - getPercentage() / 100)}`}
                className={`${getTimerColor()} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className={`text-xl font-bold ${getTimerColor()}`}>
              {timeRemaining}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-background-secondary rounded-lg border border-border-primary p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-accent-primary" />
            <span className="text-sm font-medium text-accent-primary">
              {question.category}
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-text-primary mb-8">
            {question.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onAnswerSelect(index)}
                disabled={selectedAnswer !== null || timeRemaining <= 0}
                className={`p-6 rounded-lg border-2 text-left transition-all hover:scale-105 ${getButtonStyle(index)} ${
                  selectedAnswer === null && timeRemaining > 0
                    ? 'hover:border-accent-primary cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                    selectedAnswer === null
                      ? 'border-border-primary text-text-muted'
                      : index === question.correctAnswer
                      ? 'border-emergency text-emergency'
                      : index === selectedAnswer
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-border-primary/50 text-text-muted'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>

                {/* Show correct/incorrect indicators */}
                {selectedAnswer !== null && (
                  <div className="mt-3 text-sm font-medium">
                    {index === question.correctAnswer && (
                      <span className="text-emergency">✓ Correct Answer</span>
                    )}
                    {index === selectedAnswer && index !== question.correctAnswer && (
                      <span className="text-accent-primary">✗ Your Answer</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {selectedAnswer === null && timeRemaining > 0 && (
          <div className="text-center text-sm text-text-muted">
            <Clock className="w-4 h-4 inline mr-2" />
            Select your answer before time runs out!
          </div>
        )}
      </div>
    </div>
  );
}