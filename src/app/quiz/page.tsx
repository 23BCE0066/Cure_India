'use client';

import { useState, useEffect, useCallback } from 'react';
import QuizStart from '@/components/Quiz/QuizStart';
import QuizQuestion from '@/components/Quiz/QuizQuestion';
import QuizFeedback from '@/components/Quiz/QuizFeedback';
import QuizResults from '@/components/Quiz/QuizResults';
import { getRandomQuestions, QuizQuestion, GameResults } from '@/data/quizQuestions';

type GamePhase = 'start' | 'playing' | 'feedback' | 'results';

export default function QuizPage() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [answers, setAnswers] = useState<{
    questionId: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeTaken: number;
  }[]>([]);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    explanation: string;
    pointsEarned: number;
    timeBonus: number;
    streakBonus: number;
    timeTaken: number;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    if (gamePhase === 'playing' && timeRemaining > 0 && !showFeedback) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gamePhase === 'playing' && !showFeedback) {
      // Time's up - mark as incorrect
      handleTimeout();
    }
  }, [timeRemaining, gamePhase, showFeedback]);

  // Auto-advance feedback after 3 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        moveToNextQuestion();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  const handleTimeout = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const timeTaken = 30 - timeRemaining;

    // Record the incorrect answer
    const answerRecord = {
      questionId: currentQuestion.id,
      userAnswer: -1, // No answer selected
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      timeTaken
    };

    setAnswers(prev => [...prev, answerRecord]);
    setCurrentStreak(0);
    setSelectedAnswer(-1);

    // Show feedback
    setFeedbackData({
      isCorrect: false,
      explanation: currentQuestion.explanation,
      pointsEarned: 0,
      timeBonus: 0,
      streakBonus: 0,
      timeTaken
    });
    setShowFeedback(true);
  };

  const startGame = (selectedDifficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setDifficulty(selectedDifficulty);
    const gameQuestions = getRandomQuestions(selectedDifficulty, 10);
    setQuestions(gameQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCurrentStreak(0);
    setTimeRemaining(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
    setGamePhase('playing');
    setQuestionStartTime(Date.now());
  };

  const calculatePoints = useCallback((
    isCorrect: boolean,
    timeTaken: number,
    currentStreak: number
  ) => {
    let basePoints = 0;
    let timeBonus = 0;
    let streakBonus = 0;

    // Base points based on difficulty
    if (isCorrect) {
      if (difficulty === 'beginner') {
        basePoints = 10;
      } else if (difficulty === 'intermediate') {
        basePoints = 15;
      } else if (difficulty === 'advanced') {
        basePoints = 20;
      }

      // Time bonus logic
      if (timeTaken < 15) {
        timeBonus = 5;
      } else if (timeTaken < 25) {
        timeBonus = 2;
      }

      // Streak bonus logic
      if (currentStreak >= 3) {
        streakBonus = currentStreak * 2;
      }
    }

    return { basePoints, timeBonus, streakBonus };
  }, [difficulty]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null || timeRemaining <= 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeTaken = 30 - timeRemaining;
    const { basePoints, timeBonus, streakBonus } = calculatePoints(isCorrect, timeTaken, currentStreak);
    const totalPoints = basePoints + timeBonus + streakBonus;

    // Update game state
    setSelectedAnswer(answerIndex);
    setScore(prev => prev + totalPoints);

    if (isCorrect) {
      setCurrentStreak(prev => prev + 1);
    } else {
      setCurrentStreak(0);
    }

    // Record the answer
    const answerRecord = {
      questionId: currentQuestion.id,
      userAnswer: answerIndex,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeTaken
    };
    setAnswers(prev => [...prev, answerRecord]);

    // Show feedback
    setFeedbackData({
      isCorrect,
      explanation: currentQuestion.explanation,
      pointsEarned: basePoints,
      timeBonus,
      streakBonus,
      timeTaken
    });
    setShowFeedback(true);
  }, [selectedAnswer, timeRemaining, questions, currentQuestionIndex, currentStreak, calculatePoints]);

  const moveToNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setFeedbackData(null);

    if (currentQuestionIndex >= questions.length - 1) {
      // Game complete - show results
      setGamePhase('results');
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(30);
      setQuestionStartTime(Date.now());
    }
  };

  const calculatePerformanceRating = (finalScore: number, totalPossible: number) => {
    const percentage = (finalScore / totalPossible) * 100;

    if (percentage >= 90) return 'Medical Expert';
    if (percentage >= 75) return 'Health Savvy';
    if (percentage >= 60) return 'Good Knowledge';
    return 'Keep Learning';
  };

  const getGameResults = (): GameResults => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalPossible = questions.length * (difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20);
    const performanceRating = calculatePerformanceRating(score, totalPossible);

    return {
      finalScore: score,
      totalQuestions: questions.length,
      correctAnswers,
      difficulty,
      performanceRating,
      answers
    };
  };

  const playAgain = () => {
    setGamePhase('start');
  };

  const returnHome = () => {
    window.location.href = '/';
  };

  if (gamePhase === 'start') {
    return <QuizStart onStartGame={startGame} />;
  }

  if (gamePhase === 'playing' && questions.length > 0 && !showFeedback) {
    return (
      <QuizQuestion
        question={questions[currentQuestionIndex]}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        score={score}
        streak={currentStreak}
      />
    );
  }

  if (gamePhase === 'playing' && showFeedback && feedbackData) {
    return (
      <QuizFeedback
        isCorrect={feedbackData.isCorrect}
        explanation={feedbackData.explanation}
        pointsEarned={feedbackData.pointsEarned}
        timeBonus={feedbackData.timeBonus}
        streakBonus={feedbackData.streakBonus}
        timeTaken={feedbackData.timeTaken}
        onNextQuestion={moveToNextQuestion}
        isLastQuestion={currentQuestionIndex >= questions.length - 1}
      />
    );
  }

  if (gamePhase === 'results') {
    return (
      <QuizResults
        results={getGameResults()}
        onPlayAgain={playAgain}
        onReturnHome={returnHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading quiz...</p>
      </div>
    );
  }
}