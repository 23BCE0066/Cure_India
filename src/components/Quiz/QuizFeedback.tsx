import { CheckCircle, XCircle, Lightbulb, Timer, Zap } from 'lucide-react';

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  pointsEarned: number;
  timeBonus: number;
  streakBonus: number;
  timeTaken: number;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export default function QuizFeedback({
  isCorrect,
  explanation,
  pointsEarned,
  timeBonus,
  streakBonus,
  timeTaken,
  onNextQuestion,
  isLastQuestion
}: QuizFeedbackProps) {
  const totalPoints = pointsEarned + timeBonus + streakBonus;

  return (
    <div className="fixed inset-0 bg-background-primary/95 flex items-center justify-center px-4 z-50">
      <div className="max-w-lg w-full bg-background-secondary rounded-lg border border-border-primary p-8 animate-fade-in">
        {/* Result Icon */}
        <div className="flex justify-center mb-6">
          {isCorrect ? (
            <div className="w-20 h-20 bg-emergency/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emergency" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-accent-primary" />
            </div>
          )}
        </div>

        {/* Result Message */}
        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold mb-2 ${
            isCorrect ? 'text-emergency' : 'text-accent-primary'
          }`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h2>
          <p className="text-text-secondary">
            {isCorrect
              ? 'Great job! You got it right.'
              : 'Not quite right, but keep learning!'}
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-background-tertiary rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Explanation</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="bg-background-tertiary rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-text-primary mb-4">Points Earned</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Base Points</span>
              <span className="font-bold text-text-primary">+{pointsEarned}</span>
            </div>

            {timeBonus > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-warning" />
                  <span className="text-text-secondary">Time Bonus</span>
                </div>
                <span className="font-bold text-warning">+{timeBonus}</span>
              </div>
            )}

            {streakBonus > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-primary" />
                  <span className="text-text-secondary">Streak Bonus</span>
                </div>
                <span className="font-bold text-accent-primary">+{streakBonus}</span>
              </div>
            )}

            <div className="border-t border-border-primary pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Total Points</span>
                <span className={`text-2xl font-bold ${
                  isCorrect ? 'text-emergency' : 'text-text-primary'
                }`}>
                  +{totalPoints}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Taken */}
        <div className="text-center mb-6">
          <p className="text-sm text-text-muted">
            ⏱️ Answered in {timeTaken} seconds
          </p>
        </div>

        {/* Next Button */}
        <button
          onClick={onNextQuestion}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 text-background-primary font-semibold py-4 px-6 rounded-lg transition-all hover:scale-105"
        >
          {isLastQuestion ? 'See Results' : 'Next Question'}
        </button>

        {/* Auto-advance indicator */}
        <div className="mt-4 text-center">
          <p className="text-sm text-text-muted">
            Auto-advancing in 3 seconds...
          </p>
          <div className="w-full bg-background-tertiary rounded-full h-1 mt-2">
            <div className="bg-accent-primary h-1 rounded-full animate-progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}