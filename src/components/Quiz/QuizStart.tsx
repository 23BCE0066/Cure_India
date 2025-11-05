import { Brain } from 'lucide-react';

interface QuizStartProps {
  onStartGame: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
}

export default function QuizStart({ onStartGame }: QuizStartProps) {
  const difficulties = [
    {
      level: 'beginner' as const,
      title: 'Beginner',
      description: 'Basic health knowledge',
      points: '10 points per question',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      level: 'intermediate' as const,
      title: 'Intermediate',
      description: 'Moderate medical knowledge',
      points: '15 points per question',
      color: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      level: 'advanced' as const,
      title: 'Advanced',
      description: 'Expert medical knowledge',
      points: '20 points per question',
      color: 'bg-red-600 hover:bg-red-700'
    }
  ];

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-accent-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Medical Quiz Challenge
          </h1>
          <p className="text-lg text-text-secondary mb-2">
            Test your health knowledge and learn medical facts
          </p>
          <p className="text-sm text-text-muted">
            Answer 10 questions with a 30-second timer for each
          </p>
        </div>

        <div className="bg-background-secondary rounded-lg border border-border-primary p-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-6 text-center">
            Choose Your Difficulty
          </h2>

          <div className="space-y-4">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.level}
                onClick={() => onStartGame(difficulty.level)}
                className={`w-full p-6 rounded-lg text-left transition-all hover:scale-105 ${difficulty.color} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{difficulty.title}</h3>
                    <p className="text-sm opacity-90">{difficulty.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{difficulty.points}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border-primary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-accent-primary">30</p>
                <p className="text-xs text-text-muted">Seconds per question</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-primary">10</p>
                <p className="text-xs text-text-muted">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-primary">+5</p>
                <p className="text-xs text-text-muted">Time bonus points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-primary">2x</p>
                <p className="text-xs text-text-muted">Streak bonus</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            💡 Earn bonus points for quick answers and consecutive correct answers!
          </p>
        </div>
      </div>
    </div>
  );
}