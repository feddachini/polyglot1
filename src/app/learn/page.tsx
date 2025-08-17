'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { flowService, SCRIPTS, TRANSACTIONS } from '../../lib/flow';
import { 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  X, 
  Volume2, 
  Eye, 
  EyeOff,
  Trophy,
  Clock,
  Target,
  BookOpen,
  Loader2,
  ChevronRight,
  Play,
  Square,
} from 'lucide-react';

interface Card {
  cardId: number;
  frontText: string;
  frontPhonetic?: string;
  frontLanguage: string;
  backText: string;
  backPhonetic?: string;
  backLanguage: string;
  currentLevel: number;
  levelDescription: string;
  displayText: string;
  deckConcept?: string;
  deckMeaning?: string;
}

interface LeitnerQueue {
  currentDayCards: number[];
  currentDayCount: number;
  isLeitnerDayComplete: boolean;
  totalCards: number;
  totalReviews: number;
  streakDays: number;
  recommendation: string;
  status: string;
  nextAction: string;
}

export default function LearnPage() {
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();
  
  // State management
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cardsDue, setCardsDue] = useState<Card[]>([]);
  const [leitnerQueue, setLeitnerQueue] = useState<LeitnerQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0
  });
  const [isReviewing, setIsReviewing] = useState(false);
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<any>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [addingCards, setAddingCards] = useState(false);

  // Available languages
  const languages = [
    { code: "English", name: "English", flag: "🇺🇸" },
    { code: "Spanish", name: "Spanish", flag: "🇪🇸" },
    { code: "Italian", name: "Italian", flag: "🇮🇹" },
    { code: "French", name: "French", flag: "🇫🇷" },
    { code: "German", name: "German", flag: "🇩🇪" },
  ];

  // Load user's learning data
  useEffect(() => {
    loadLearningData();
  }, [primaryWallet]);

  const loadLearningData = async () => {
    if (!primaryWallet?.address) return;
    
    setLoading(true);
    try {
      console.log('Loading learning data for:', primaryWallet.address);
      
      // Get FCL user address
      const fclUserAddress = await flowService.getCurrentUserAddress();
      const flowAddress = fclUserAddress || flowService.normalizeAddress(primaryWallet.address);
      
      // Load cards due for review
      const cardsResult = await flowService.executeScript(SCRIPTS.GET_CARDS_DUE, [flowAddress]);
      console.log('Cards due for review:', cardsResult);
      
      // Load Leitner queue information
      const queueResult = await flowService.executeScript(SCRIPTS.GET_LEITNER_QUEUE, [flowAddress]);
      console.log('Leitner queue info:', queueResult);
      
      setCardsDue(cardsResult || []);
      setLeitnerQueue(queueResult);
      
      if (cardsResult && cardsResult.length > 0) {
        setCurrentCard(cardsResult[0]);
        setCurrentCardIndex(0);
      }
      
    } catch (error) {
      console.error('Failed to load learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewCard = async (correct: boolean) => {
    if (!currentCard || isReviewing) return;
    
    setIsReviewing(true);
    try {
      console.log(`Reviewing card ${currentCard.cardId} as ${correct ? 'correct' : 'incorrect'}`);
      
      if (correct) {
        // Correct answer: send transaction and move to next card
        await flowService.sendTransaction(TRANSACTIONS.REVIEW_CARD, [
          currentCard.cardId,
          correct
        ]);
        
        // Update session stats
        setSessionStats(prev => ({
          reviewed: prev.reviewed + 1,
          correct: prev.correct + 1,
          incorrect: prev.incorrect
        }));
        
        // Move to next card
        const nextIndex = currentCardIndex + 1;
        if (nextIndex < cardsDue.length) {
          setCurrentCardIndex(nextIndex);
          setCurrentCard(cardsDue[nextIndex]);
          setShowAnswer(false);
        } else {
          // All cards reviewed for today
          setCurrentCard(null);
          await loadLearningData(); // Refresh to get updated queue
        }
      } else {
        // Incorrect answer: NO transaction, just move card to end of queue
        // Update session stats
        setSessionStats(prev => ({
          reviewed: prev.reviewed + 1,
          correct: prev.correct,
          incorrect: prev.incorrect + 1
        }));
        
        // Move current card to end of the queue
        const updatedCardsDue = [...cardsDue];
        const currentCardData = updatedCardsDue[currentCardIndex];
        updatedCardsDue.splice(currentCardIndex, 1); // Remove from current position
        updatedCardsDue.push(currentCardData); // Add to end
        setCardsDue(updatedCardsDue);
        
        // Move to next card (same index since we removed current)
                 if (currentCardIndex < updatedCardsDue.length) {
           setCurrentCard(updatedCardsDue[currentCardIndex]);
           setShowAnswer(false);
         } else {
           // We've reached the end, but there are still cards (moved to end)
           setCurrentCardIndex(0);
           setCurrentCard(updatedCardsDue[0]);
           setShowAnswer(false);
         }
        
        console.log(`Incorrect answer - moved card to end of queue, ${updatedCardsDue.length} cards remaining`);
      }
      
    } catch (error) {
      console.error('Failed to review card:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const completeLeitnerDay = async () => {
    setLoading(true);
    try {
      console.log('Completing Leitner day...');
      
      await flowService.sendTransaction(TRANSACTIONS.COMPLETE_LEITNER_DAY, []);
      
      // Show deck selection for next day
      setShowDeckSelection(true);
      await loadAvailableDecks();
      
      // Reset session stats
      setSessionStats({
        reviewed: 0,
        correct: 0,
        incorrect: 0
      });
      
    } catch (error) {
      console.error('Failed to complete Leitner day:', error);
      setLoading(false);
    }
  };

  // Load available decks for selection
  const loadAvailableDecks = async () => {
    setLoadingDecks(true);
    try {
      const decks = await flowService.executeScript(SCRIPTS.GET_ALL_DECKS, []);
      setAvailableDecks(decks || []);
    } catch (error) {
      console.error('Failed to load available decks:', error);
    } finally {
      setLoadingDecks(false);
      setLoading(false);
    }
  };

  // Select a deck for adding cards
  const selectDeck = (deck: any) => {
    setSelectedDeck(deck);
    setSelectedLanguages([]); // Reset language selection
  };

  // Toggle language selection
  const toggleLanguage = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      setSelectedLanguages(prev => prev.filter(lang => lang !== languageCode));
    } else {
      setSelectedLanguages(prev => [...prev, languageCode]);
    }
  };

  // Add cards from selected deck to Leitner system
  const addCardsToLeitnerSystem = async () => {
    if (!selectedDeck || selectedLanguages.length === 0) return;
    
    setAddingCards(true);
    try {
      console.log(`Adding cards from deck ${selectedDeck.id} for languages:`, selectedLanguages);
      
      const deckId = Number(selectedDeck.id);
      await flowService.sendTransaction(TRANSACTIONS.ADD_LEITNER_CARDS, [deckId, selectedLanguages]);
      
      console.log('Cards added successfully');
      
      // Close deck selection and refresh learning data
      setShowDeckSelection(false);
      setSelectedDeck(null);
      setSelectedLanguages([]);
      await loadLearningData();
      
    } catch (error) {
      console.error('Failed to add cards:', error);
    } finally {
      setAddingCards(false);
    }
  };

  const speakText = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Map language codes to speech synthesis language codes
      const langMap: Record<string, string> = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'Italian': 'it-IT',
        'German': 'de-DE'
      };
      utterance.lang = langMap[language] || 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!primaryWallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">You need to connect your wallet to access the learning system.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Learning Session</h2>
          <p className="text-gray-600">Fetching your cards and progress...</p>
        </div>
      </div>
    );
  }

  // No cards due - show completion/status
  if (!currentCard || cardsDue.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </button>
          </div>

          {/* Completion Card */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Great Work!</h2>
            
            {leitnerQueue?.isLeitnerDayComplete ? (
              <>
                <p className="text-gray-600 mb-6">
                  You've completed today's Leitner session! 🎉
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Session Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{sessionStats.reviewed}</div>
                      <div className="text-gray-600">Reviewed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                      <div className="text-gray-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                      <div className="text-gray-600">Incorrect</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={completeLeitnerDay}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Completing Day...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Leitner Day
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  No cards are due for review right now.
                </p>
                {leitnerQueue && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600">{leitnerQueue.recommendation}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add More Cards
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active learning session
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </button>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {currentCardIndex + 1} / {cardsDue.length}

            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {sessionStats.reviewed} reviewed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / cardsDue.length) * 100}%` }}
          />
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          {/* Card Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 capitalize">
                  {currentCard.deckConcept || 'Vocabulary'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  Level {currentCard.currentLevel}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {currentCard.levelDescription}
                </span>
              </div>
            </div>
          </div>



          {/* Card Content */}
          <div className="p-8">
            {/* Front Side */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Translate from {currentCard.frontLanguage} to {currentCard.backLanguage}
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  How do you say:
                </h3>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {currentCard.frontText}
                </h2>
                {currentCard.frontPhonetic && (
                  <p className="text-xl text-gray-600 font-mono mb-3">
                    /{currentCard.frontPhonetic}/
                  </p>
                )}
                <h3 className="text-lg font-medium text-blue-700">
                  in {currentCard.backLanguage}?
                </h3>
              </div>
              <button
                onClick={() => speakText(currentCard.frontText, currentCard.frontLanguage)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </button>
            </div>

            {/* Show Answer Toggle */}
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Eye className="w-5 h-5" />
                  Show Answer
                </button>
              </div>
            ) : (
              <>
                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-gray-200" />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Back Side */}
                <div className="text-center mb-8">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {currentCard.backLanguage}
                    </span>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-4xl font-bold text-green-700 mb-2">
                      {currentCard.backText}
                    </h2>
                    {currentCard.backPhonetic && (
                      <p className="text-xl text-gray-600 font-mono">
                        /{currentCard.backPhonetic}/
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => speakText(currentCard.backText, currentCard.backLanguage)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen
                  </button>
                </div>

                {/* Review Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => reviewCard(false)}
                    disabled={isReviewing}
                    className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold border border-red-200 disabled:opacity-50"
                  >
                    {isReviewing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    Incorrect
                  </button>
                  <button
                    onClick={() => reviewCard(true)}
                    disabled={isReviewing}
                    className="flex items-center justify-center gap-2 py-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-semibold border border-green-200 disabled:opacity-50"
                  >
                    {isReviewing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    Correct
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Session Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Session Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{sessionStats.reviewed}</div>
              <div className="text-sm text-gray-600">Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
          </div>
          
          {sessionStats.reviewed > 0 && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                Accuracy: {Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deck Selection Modal for Next Day */}
      {showDeckSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">🎉 Leitner Day Complete!</h2>
              <p className="text-gray-600 mt-2">Choose a deck and languages for tomorrow's learning session.</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {!selectedDeck ? (
                // Deck Selection
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Deck</h3>
                  
                  {loadingDecks ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-3 text-gray-600">Loading decks...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableDecks.map((deck) => (
                        <div
                          key={deck.id}
                          onClick={() => selectDeck(deck)}
                          className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">📚</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 capitalize mb-1">{deck.concept}</h4>
                              <p className="text-sm text-gray-600 mb-2">{deck.meaning}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                  ID: {deck.id}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Language Selection
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Selected Deck: {selectedDeck.concept}
                    </h3>
                    <p className="text-gray-600">{selectedDeck.meaning}</p>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Languages for Tomorrow
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={`p-4 rounded-lg cursor-pointer transition-all border ${
                          selectedLanguages.includes(lang.code)
                            ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{lang.name}</h4>
                              {selectedLanguages.includes(lang.code) && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedDeck(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Back to Decks
                    </button>
                    <button
                      onClick={addCardsToLeitnerSystem}
                      disabled={selectedLanguages.length === 0 || addingCards}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {addingCards ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding Cards...
                        </>
                      ) : (
                        `Add Cards for Tomorrow`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowDeckSelection(false);
                  setSelectedDeck(null);
                  setSelectedLanguages([]);
                  loadLearningData(); // Refresh without adding new cards
                }}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip - Continue to next day without new cards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 