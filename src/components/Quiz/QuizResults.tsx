import { Trophy, Target, Clock, RotateCcw, Home, Brain, CheckCircle, XCircle } from 'lucide-react';
import { GameResults } from '@/data/quizQuestions';

interface QuizResultsProps {
  results: GameResults;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export default function QuizResults({ results, onPlayAgain, onReturnHome }: QuizResultsProps) {
  const getPerformanceIcon = () => {
    switch (results.performanceRating) {
      case 'Medical Expert':
        return '🏆';
      case 'Health Savvy':
        return '🌟';
      case 'Good Knowledge':
        return '👍';
      default:
        return '📚';
    }
  };

  const getPerformanceColor = () => {
    switch (results.performanceRating) {
      case 'Medical Expert':
        return 'text-emergency';
      case 'Health Savvy':
        return 'text-warning';
      case 'Good Knowledge':
        return 'text-accent-primary';
      default:
        return 'text-text-secondary';
    }
  };

  const accuracy = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const averageTime = Math.round(
    results.answers.reduce((sum, answer) => sum + answer.timeTaken, 0) / results.totalQuestions
  );

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-accent-primary">
            <span className="text-4xl">{getPerformanceIcon()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Quiz Complete!
          </h1>
          <h2 className={`text-2xl font-semibold mb-2 ${getPerformanceColor()}`}>
            {results.performanceRating}
          </h2>
          <p className="text-text-secondary">
            Great job testing your medical knowledge!
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-background-secondary rounded-lg border border-border-primary p-8 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-accent-primary" />
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">{results.finalScore}</p>
              <p className="text-sm text-text-muted">Final Score</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emergency/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-emergency" />
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">{accuracy}%</p>
              <p className="text-sm text-text-muted">Accuracy</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-warning" />
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">
                {results.correctAnswers}/{results.totalQuestions}
              </p>
              <p className="text-sm text-text-muted">Correct</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-text-secondary" />
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">{averageTime}s</p>
              <p className="text-sm text-text-muted">Avg Time</p>
            </div>
          </div>

          {/* Difficulty Info */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Brain className="w-5 h-5 text-accent-primary" />
            <span className="text-text-secondary">
              Difficulty: <span className="font-semibold text-text-primary capitalize">{results.difficulty}</span>
            </span>
          </div>

          {/* Answer History */}
          <div className="border-t border-border-primary pt-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">
              Answer History
            </h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {results.answers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-bold ${
                    answer.isCorrect
                      ? 'bg-emergency/20 text-emergency'
                      : 'bg-accent-primary/20 text-accent-primary'
                  }`}
                >
                  {answer.isCorrect ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emergency/20 rounded flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-emergency" />
                </div>
                <span className="text-sm text-text-muted">Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent-primary/20 rounded flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-accent-primary" />
                </div>
                <span className="text-sm text-text-muted">Incorrect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Messages */}
        <div className="bg-background-secondary rounded-lg border border-border-primary p-6 mb-6">
          <div className="text-center">
            {results.performanceRating === 'Medical Expert' && (
              <>
                <p className="text-lg font-semibold text-emergency mb-2">
                  🎉 Outstanding Performance!
                </p>
                <p className="text-text-secondary">
                  You have exceptional medical knowledge. Your score demonstrates expertise in health and medical concepts.
                </p>
              </>
            )}
            {results.performanceRating === 'Health Savvy' && (
              <>
                <p className="text-lg font-semibold text-warning mb-2">
                  🌟 Excellent Work!
                </p>
                <p className="text-text-secondary">
                  You have a strong understanding of health topics. Your knowledge is well above average!
                </p>
              </>
            )}
            {results.performanceRating === 'Good Knowledge' && (
              <>
                <p className="text-lg font-semibold text-accent-primary mb-2">
                  👍 Good Job!
                </p>
                <p className="text-text-secondary">
                  You have a solid foundation of health knowledge. Keep learning to improve even more!
                </p>
              </>
            )}
            {results.performanceRating === 'Keep Learning' && (
              <>
                <p className="text-lg font-semibold text-text-secondary mb-2">
                  📚 Keep Learning!
                </p>
                <p className="text-text-secondary">
                  Health knowledge is a journey. Use this as motivation to continue learning about medical topics!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-background-primary font-semibold py-4 px-6 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={onReturnHome}
            className="flex-1 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary font-semibold py-4 px-6 rounded-lg border border-border-primary transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}