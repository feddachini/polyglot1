'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Check, X, BookOpen, Calendar, Target, TrendingUp } from 'lucide-react';

// Type definitions
interface Language {
  lang: string;
  text: string;
  pronunciation: string;
}

interface Deck {
  id: number;
  concept: string;
  languages: Language[];
  level: number;
  nextReview: Date;
}

// Sample data structure for multi-language decks
const sampleDecks = [
  {
    id: 1,
    concept: "Hello",
    languages: [
      { lang: "Spanish", text: "Hola", pronunciation: "OH-lah" },
      { lang: "French", text: "Bonjour", pronunciation: "bon-ZHOOR" },
      { lang: "German", text: "Hallo", pronunciation: "HAH-loh" },
      { lang: "Japanese", text: "こんにちは", pronunciation: "kon-ni-chi-wa" }
    ],
    level: 1,
    nextReview: new Date(Date.now() + 86400000) // tomorrow
  },
  {
    id: 2,
    concept: "Thank you",
    languages: [
      { lang: "Spanish", text: "Gracias", pronunciation: "GRAH-see-ahs" },
      { lang: "French", text: "Merci", pronunciation: "mer-SEE" },
      { lang: "German", text: "Danke", pronunciation: "DAHN-keh" },
      { lang: "Japanese", text: "ありがとう", pronunciation: "a-ri-ga-tou" }
    ],
    level: 2,
    nextReview: new Date(Date.now() + 172800000) // 2 days
  },
  {
    id: 3,
    concept: "Water",
    languages: [
      { lang: "Spanish", text: "Agua", pronunciation: "AH-gwah" },
      { lang: "French", text: "Eau", pronunciation: "oh" },
      { lang: "German", text: "Wasser", pronunciation: "VAH-ser" },
      { lang: "Japanese", text: "水", pronunciation: "mi-zu" }
    ],
    level: 1,
    nextReview: new Date()
  }
];

export default function LeitnerLang() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'study'>('dashboard');
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [studyQueue, setStudyQueue] = useState<Deck[]>([]);
  const [completedToday, setCompletedToday] = useState<number>(12);
  const [streak, setStreak] = useState<number>(7);

  useEffect(() => {
    // Initialize study queue with cards due today
    const dueCards = sampleDecks.filter(deck => 
      new Date(deck.nextReview) <= new Date()
    );
    setStudyQueue(dueCards);
  }, []);

  const startStudying = () => {
    if (studyQueue.length > 0) {
      setCurrentDeck(studyQueue[0]);
      setCurrentView('study');
      setCurrentLanguageIndex(0);
      setIsFlipped(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (!currentDeck) return;

    // Update deck level based on SRS
    const newLevel = correct ? Math.min(currentDeck.level + 1, 5) : 1;
    const daysToAdd = Math.pow(2, newLevel - 1);
    
    // Remove current deck from queue
    const newQueue = studyQueue.slice(1);
    setStudyQueue(newQueue);
    
    if (correct) {
      setCompletedToday(prev => prev + 1);
    }

    // Move to next card or return to dashboard
    if (newQueue.length > 0) {
      setCurrentDeck(newQueue[0]);
      setCurrentLanguageIndex(0);
      setIsFlipped(false);
    } else {
      setCurrentView('dashboard');
      setCurrentDeck(null);
    }
  };

  const cycleLanguage = () => {
    if (currentDeck) {
      setCurrentLanguageIndex((prev) => 
        (prev + 1) % currentDeck.languages.length
      );
      setIsFlipped(false);
    }
  };

  const DashboardView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Polyglot</h1>
          <p className="text-gray-600">Learn multiple languages, one concept at a time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{completedToday}</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Streak</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{streak} days</div>
          </div>
        </div>

        {/* Study Button */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to Study?</h2>
            <p className="text-gray-600 mb-4">{studyQueue.length} cards due today</p>
            <button
              onClick={startStudying}
              disabled={studyQueue.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {studyQueue.length > 0 ? 'Start Studying' : 'All Done for Today!'}
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-800">Learning Progress</span>
          </div>
          <div className="space-y-2">
            {['Spanish', 'French', 'German', 'Japanese'].map((lang, idx) => (
              <div key={lang} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{lang}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${20 + idx * 20}%`}}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{20 + idx * 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StudyView = () => {
    if (!currentDeck) return null;

    const currentLanguage = currentDeck.languages[currentLanguageIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-sm text-gray-600">
                {studyQueue.length} cards remaining
              </div>
            </div>
            <div className="w-10"></div>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center mb-6">
            <button
              onClick={cycleLanguage}
              className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {currentLanguage.lang} ({currentLanguageIndex + 1}/{currentDeck.languages.length})
            </button>
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <div 
              className="bg-white rounded-2xl shadow-lg min-h-[300px] flex flex-col justify-center items-center p-8 cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {!isFlipped ? (
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-4">Concept</div>
                  <div className="text-3xl font-bold text-gray-800 mb-4">
                    {currentDeck.concept}
                  </div>
                  <div className="text-sm text-gray-400">
                    Tap to see {currentLanguage.lang}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">{currentLanguage.lang}</div>
                  <div className="text-4xl font-bold text-purple-700 mb-3">
                    {currentLanguage.text}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    /{currentLanguage.pronunciation}/
                  </div>
                  <div className="text-sm text-gray-400">
                    How did you do?
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isFlipped && (
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 bg-red-500 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
                Again
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 bg-green-500 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <Check className="w-5 h-5" />
                Good
              </button>
            </div>
          )}

          {!isFlipped && (
            <div className="text-center">
              <button
                onClick={cycleLanguage}
                className="bg-white text-gray-700 py-3 px-6 rounded-xl font-medium shadow-sm border hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Different Language
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return currentView === 'dashboard' ? <DashboardView /> : <StudyView />;
}