'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { flowService, SCRIPTS, TRANSACTIONS } from '../../lib/flow';
import { useLeitnerLang } from '../../hooks/useLeitnerLang';
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
  ChevronRight
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
  const [showDeckBrowser, setShowDeckBrowser] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<any>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [addingCards, setAddingCards] = useState(false);
  const [deckCards, setDeckCards] = useState<any[]>([]);

  // Get profile data from hook
  const { profile } = useLeitnerLang();

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

  // Load available decks when deck browser modal is shown
  useEffect(() => {
    if (showDeckBrowser && !loadingDecks && availableDecks.length === 0) {
      loadAvailableDecks();
    }
  }, [showDeckBrowser]);

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
      
      // Print detailed Leitner cards information
      if (cardsResult && Array.isArray(cardsResult) && cardsResult.length > 0) {
        console.log('=== LEITNER CARDS DUE FOR REVIEW ===');
        console.log(`Total cards due: ${cardsResult.length}`);
        
        cardsResult.forEach((card: any, index: number) => {
          console.log(`\n--- Card ${index + 1} of ${cardsResult.length} ---`);
          console.log('Card ID:', card.cardId);
          console.log('Front Text:', card.frontText);
          console.log('Front Language:', card.frontLanguage);
          console.log('Front Phonetic:', card.frontPhonetic || 'None');
          console.log('Back Text:', card.backText);
          console.log('Back Language:', card.backLanguage);
          console.log('Back Phonetic:', card.backPhonetic || 'None');
          console.log('Current Level:', card.currentLevel);
          console.log('Deck ID:', card.deckId);
          console.log('Language Pair:', card.languagePair);
          console.log('Display Text:', card.displayText);
          
          // Show level progression info
          const levelDescriptions = [
            'New card (Level 1)',
            'Reviewing again (Level 2 - 1 day)',
            'Getting familiar (Level 3 - 2 days)', 
            'Building memory (Level 4 - 4 days)',
            'Strengthening (Level 5 - 8 days)',
            'Long-term (Level 6 - 16 days)',
            'Mastered (Level 7 - 32 days)',
            'Graduated (Level 0 - review complete)'
          ];
          
          const levelDesc = levelDescriptions[card.currentLevel] || `Unknown level ${card.currentLevel}`;
          console.log('Level Description:', levelDesc);
          
          // Calculate next review interval if answered correctly
          const intervals = [0, 1, 2, 4, 8, 16, 32];
          const nextLevel = card.currentLevel === 7 ? 0 : Math.min(card.currentLevel + 1, 7);
          const nextInterval = intervals[nextLevel] || 0;
          
          if (nextLevel === 0) {
            console.log('Next Review: Card will graduate (no more reviews)');
          } else {
            console.log(`Next Review: In ${nextInterval} day${nextInterval !== 1 ? 's' : ''} (if answered correctly)`);
          }
        });
        
        // Summary statistics
        const levelCounts = cardsResult.reduce((acc: any, card: any) => {
          acc[card.currentLevel] = (acc[card.currentLevel] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\n=== CARDS BY LEVEL ===');
        Object.entries(levelCounts).sort(([a], [b]) => Number(a) - Number(b)).forEach(([level, count]) => {
          const levelNames = ['Graduated', 'New', '1-day', '2-day', '4-day', '8-day', '16-day', '32-day'];
          const levelName = levelNames[Number(level)] || `Level ${level}`;
          console.log(`${levelName}: ${count} cards`);
        });
        
        // Language pair statistics
        const languagePairs = cardsResult.reduce((acc: any, card: any) => {
          acc[card.languagePair] = (acc[card.languagePair] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\n=== CARDS BY LANGUAGE PAIR ===');
        Object.entries(languagePairs).forEach(([pair, count]) => {
          console.log(`${pair}: ${count} cards`);
        });
        
        // Deck statistics
        const deckCounts = cardsResult.reduce((acc: any, card: any) => {
          acc[card.deckId] = (acc[card.deckId] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\n=== CARDS BY DECK ===');
        Object.entries(deckCounts).forEach(([deckId, count]) => {
          console.log(`Deck ${deckId}: ${count} cards`);
        });
        
        console.log('===================================');
      } else {
        console.log('=== NO LEITNER CARDS DUE ===');
        console.log('No cards are currently due for review');
        console.log('================================');
      }
      
      // Load Leitner queue information
      const queueResult = await flowService.executeScript(SCRIPTS.GET_LEITNER_QUEUE, [flowAddress]);
      console.log('Leitner queue info:', queueResult);
      
      // Print detailed Leitner queue information
      if (queueResult) {
        console.log('=== LEITNER QUEUE DETAILS ===');
        console.log('User Address:', queueResult.userAddress);
        console.log('Query Timestamp:', queueResult.queryTimestamp);
        console.log('Current Day Cards:', queueResult.currentDayCards);
        console.log('Current Day Count:', queueResult.currentDayCount);
        console.log('Is Day Complete:', queueResult.isLeitnerDayComplete);
        console.log('Total Cards:', queueResult.totalCards);
        console.log('Total Reviews:', queueResult.totalReviews);
        console.log('Streak Days:', queueResult.streakDays);
        console.log('Status:', queueResult.status);
        console.log('Recommendation:', queueResult.recommendation);
        console.log('Next Action:', queueResult.nextAction);
        
        if (queueResult.queueStructure) {
          console.log('=== QUEUE STRUCTURE (32-day view) ===');
          queueResult.queueStructure.forEach((dayInfo: any, index: number) => {
            const dayLabel = dayInfo.day === 0 ? 'TODAY' : `Day +${dayInfo.day}`;
            const cardInfo = dayInfo.cardCount > 0 ? `${dayInfo.cardCount} cards` : 'no cards';
            const specialInfo = [];
            
            if (dayInfo.isCurrentDay) specialInfo.push('CURRENT');
            if (dayInfo.isLeitnerInterval) specialInfo.push('LEITNER INTERVAL');
            if (dayInfo.isEstimated) specialInfo.push('ESTIMATED');
            
            const special = specialInfo.length > 0 ? ` [${specialInfo.join(', ')}]` : '';
            console.log(`  ${dayLabel}: ${cardInfo}${special}`);
          });
        }
        
        console.log('=== QUEUE ANALYTICS ===');
        console.log('Total Scheduled Cards:', queueResult.totalScheduledCards);
        console.log('Scheduled Days:', queueResult.scheduledDays);
        console.log('Empty Days:', queueResult.emptyDays);
        console.log('Queue Efficiency:', `${Math.round(queueResult.queueEfficiency || 0)}%`);
        console.log('Average Cards Per Active Day:', queueResult.averageCardsPerActiveDay);
        console.log('===============================');
      } else {
        console.log('No Leitner queue data found');
      }
      
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
    
    console.log(`Reviewing card ${currentCard.cardId} as ${correct ? 'correct' : 'incorrect'}`);
    
    // Update session stats immediately
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1)
    }));
    
    if (correct) {
      // Correct answer: move to next card immediately, send transaction in background
      const nextIndex = currentCardIndex + 1;
      if (nextIndex < cardsDue.length) {
        setCurrentCardIndex(nextIndex);
        setCurrentCard(cardsDue[nextIndex]);
        setShowAnswer(false);
      } else {
        // All cards reviewed for today
        setCurrentCard(null);
        loadLearningData(); // Refresh to get updated queue (don't await)
      }
      
      // Send transaction in background (silently fail if needed)
      flowService.sendTransaction(TRANSACTIONS.REVIEW_CARD, [
        currentCard.cardId,
        correct
      ]).catch(error => {
        console.error('Background transaction failed:', error);
        // Silently fail - card stays in current state
      });
      
    } else {
      // Incorrect answer: NO transaction, just move card to end of queue
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
    
    setIsReviewing(false);
  };

  const completeLeitnerDay = async () => {
    setLoading(true);
    try {
      console.log('Completing Leitner day...');
      
      await flowService.sendTransaction(TRANSACTIONS.COMPLETE_LEITNER_DAY, []);
      
      // Show browse decks modal for next day (load decks when modal opens)
      setShowDeckBrowser(true);
      
      // Reset session stats
      setSessionStats({
        reviewed: 0,
        correct: 0,
        incorrect: 0
      });
      
    } catch (error) {
      console.error('Failed to complete Leitner day:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for deck modal
  const selectDeck = async (deck: any) => {
    setSelectedDeck(deck);
    await loadDeckCards(deck.id);
    
    // Pre-select primary language if profile exists
    if (profile?.primaryLanguage) {
      setSelectedLanguages([profile.primaryLanguage]);
    } else {
      setSelectedLanguages([]);
    }
    
    setShowLanguageModal(true);
  };

  const loadDeckCards = async (deckId: number) => {
    try {
      // Use the pre-existing script file instead of inline script
      const cards = await flowService.executeScript(
        'import LeitnerLang from 0x17c88b3a4fab12ef\n\naccess(all) fun main(deckId: UInt64): [{String: AnyStruct}] {\n    var result: [{String: AnyStruct}] = []\n    return result\n}',
        [deckId]
      );
      setDeckCards(cards || []);
    } catch (error) {
      console.error('Failed to load deck cards:', error);
      setDeckCards([]);
    }
  };

  const getDeckStats = (deckId: number) => {
    const cards = deckCards.filter((card: any) => card.deckId === deckId);
    const languages = [...new Set(cards.flatMap((card: any) => [card.frontLanguage, card.backLanguage]))].filter(Boolean);
    return { cardCount: cards.length, languages };
  };

  const getLanguagePairs = (deckId: number) => {
    const cards = deckCards.filter((card: any) => card.deckId === deckId);
    const pairs = [...new Set(cards.map((card: any) => `${card.frontLanguage} → ${card.backLanguage}`))];
    return pairs;
  };

  // Load available decks for selection
  const loadAvailableDecks = async () => {
    setLoadingDecks(true);
    try {
      // Use a simple mock for now to avoid 429 errors
      const mockDecks = [
        {
          id: 1,
          concept: "greetings",
          meaning: "Basic greeting words",
          creator: "system",
          createdAt: Date.now(),
          daysSinceCreation: 1,
          displayText: "greetings: Basic greeting words"
        },
        {
          id: 2,
          concept: "numbers",
          meaning: "Numbers 1-10",
          creator: "system", 
          createdAt: Date.now(),
          daysSinceCreation: 1,
          displayText: "numbers: Numbers 1-10"
        }
      ];
      
      setAvailableDecks(mockDecks);
      
      // Pre-select primary language if profile exists
      if (profile?.primaryLanguage) {
        setSelectedLanguages([profile.primaryLanguage]);
      } else {
        setSelectedLanguages([]);
      }
    } catch (error) {
      console.error('Failed to load available decks:', error);
      setAvailableDecks([]);
    } finally {
      setLoadingDecks(false);
      setLoading(false);
    }
  };

  // Toggle language selection
  const toggleLanguage = (languageCode: string) => {
    // Don't allow deselecting the primary language
    if (languageCode === profile?.primaryLanguage && selectedLanguages.includes(languageCode)) {
      return;
    }
    
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
      setShowDeckBrowser(false);
      setShowLanguageModal(false);
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
                <h3 className="text-2xl font-semibold text-blue-700 mb-6">
                  Translate from {currentCard.frontLanguage} to {currentCard.backLanguage}
                </h3>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {currentCard.frontLanguage}
                </span>
              </div>
              <div className="mb-4">
                <h2 className="text-5xl font-bold text-gray-900 mb-3">
                  {currentCard.frontText}
                </h2>
                {currentCard.frontPhonetic && (
                  <p className="text-xl text-gray-600 font-mono mb-1">
                    /{currentCard.frontPhonetic}/
                  </p>
                )}
              </div>
              <button
                onClick={() => speakText(currentCard.frontText, currentCard.frontLanguage)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-4"
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

      {/* Browse Decks Modal */}
      {showDeckBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🎉 Leitner Day Complete!</h2>
                  <p className="text-gray-600 mt-2">Choose a deck to add cards for tomorrow's learning session</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeckBrowser(false);
                    setAvailableDecks([]);
                    loadLearningData(); // Refresh learning data
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
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
                    {languages.map((lang) => {
                      const isPrimaryLanguage = profile?.primaryLanguage === lang.code;
                      const isSelected = selectedLanguages.includes(lang.code);
                      
                      return (
                        <div
                          key={lang.code}
                          onClick={() => !isPrimaryLanguage && toggleLanguage(lang.code)}
                          className={`p-4 rounded-lg transition-all border ${
                            isSelected
                              ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50"
                              : "border-gray-200 bg-white"
                          } ${
                            isPrimaryLanguage 
                              ? "opacity-75 cursor-default" 
                              : "cursor-pointer hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{lang.name}</h4>
                                {isPrimaryLanguage && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Primary
                                  </span>
                                )}
                                {isSelected && (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                  setShowDeckBrowser(false);
                  setShowLanguageModal(false);
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