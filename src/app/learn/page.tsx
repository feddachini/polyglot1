'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  X, 
  Eye, 
  Lightbulb,
  Star,
  Clock,
  Target
} from 'lucide-react';

interface Card {
  id: string;
  front: string;
  back: string;
  deck: string;
  language: string;
  level: number;
  isNew: boolean;
}

export default function LearnPage() {
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    startTime: Date.now()
  });

  // Mock cards - replace with data from your contract
  const mockCards: Card[] = [
    {
      id: '1',
      front: 'Hello',
      back: 'Hola',
      deck: 'Spanish Basics',
      language: 'Spanish',
      level: 1,
      isNew: true
    },
    {
      id: '2',
      front: 'Thank you',
      back: 'Gracias',
      deck: 'Spanish Basics',
      language: 'Spanish',
      level: 1,
      isNew: false
    },
    {
      id: '3',
      front: 'Good morning',
      back: 'Buenos días',
      deck: 'Spanish Basics',
      language: 'Spanish',
      level: 2,
      isNew: false
    },
    {
      id: '4',
      front: 'Water',
      back: 'Acqua',
      deck: 'Italian Basics',
      language: 'Italian',
      level: 1,
      isNew: true
    },
    {
      id: '5',
      front: 'Bread',
      back: 'Pain',
      deck: 'French Basics',
      language: 'French',
      level: 1,
      isNew: false
    }
  ];

  const [cards, setCards] = useState<Card[]>(mockCards);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (cards.length > 0) {
      setCurrentCard(cards[currentIndex]);
    }
  }, [currentIndex, cards]);

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return;

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1
    }));

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      router.push('/learn/results');
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({
      correct: 0,
      incorrect: 0,
      total: 0,
      startTime: Date.now()
    });
  };

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - sessionStats.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAccuracy = () => {
    if (sessionStats.total === 0) return 0;
    return Math.round((sessionStats.correct / sessionStats.total) * 100);
  };

  if (!primaryWallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to start learning</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Cards Available</h2>
          <p className="text-gray-600 mb-6">Please create some decks and cards to start learning</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-gray-900">{currentIndex + 1} of {cards.length}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-900">{getElapsedTime()}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-900">{getAccuracy()}% accuracy</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Card Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{currentCard.deck}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">{currentCard.language}</span>
            {currentCard.isNew && (
              <>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">New</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">Level {currentCard.level}</div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 min-h-[300px] flex flex-col">
          {/* Front of card */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {currentCard.front}
              </div>
              
              {!showAnswer && (
                <button
                  onClick={handleRevealAnswer}
                  className="flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>Show Answer</span>
                </button>
              )}
            </div>
          </div>

          {/* Answer (shown when revealed) */}
          {showAnswer && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-3">
                  {currentCard.back}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lightbulb className="w-4 h-4" />
                  <span>Answer in {currentCard.language}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showAnswer ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <X className="w-5 h-5" />
              Incorrect
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Check className="w-5 h-5" />
              Correct
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Try to remember the translation, then reveal the answer</p>
          </div>
        )}

        {/* Session Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
            <div className="text-sm text-gray-600">Incorrect</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{sessionStats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
} 