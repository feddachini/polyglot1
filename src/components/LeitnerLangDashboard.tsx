'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useLeitnerLang } from '../hooks/useLeitnerLang';
import { flowService, SCRIPTS, TRANSACTIONS } from '../lib/flow';
import {
  BookOpen,
  Target,
  Clock,
  Trophy,
  Plus,
  Users,
  Flame,
  Loader2,
  ChevronRight,
  Globe,
  Check,
  X,
  Eye,
  Play,
  Settings,
  Library,
  BarChart3,
  Calendar,
  Wallet,
  Network,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Deck {
  id: number;
  concept: string;
  meaning: string;
  displayText: string;
  creator: string;
  createdAt: number;
  daysSinceCreation: number;
}

interface Language {
  code: string;
  name: string;
  flag: string;
  difficulty: string;
  learners: string;
  description: string;
}

export default function LeitnerLangDashboard() {
  const router = useRouter();
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const {
    decks,
    profile,
    loading,
    error,
    isConnected,
    userAddress,
    contractAddress,
    coaAddress,
    network,
    fundAccount,
    setupProfile,
    createDeck,
    createCard,
    loadUserData
  } = useLeitnerLang();

  // State for deck browser and language selection
  const [showDeckBrowser, setShowDeckBrowser] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [addingCards, setAddingCards] = useState(false);
  const [deckCards, setDeckCards] = useState<any[]>([]);
  const [deckStats, setDeckStats] = useState<{[key: number]: {cardCount: number, languages: string[]}}>({});
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [queueData, setQueueData] = useState<any>(null);

  // Modal states
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showSetupProfile, setShowSetupProfile] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');

  // Available languages
  const languages: Language[] = [
    {
      code: "English",
      name: "English",
      flag: "🇺🇸",
      difficulty: "Base Language",
      learners: "1.5B+",
      description: "Your base language for learning",
    },
    {
      code: "Spanish",
      name: "Spanish",
      flag: "🇪🇸",
      difficulty: "Beginner Friendly",
      learners: "500M+",
      description: "Perfect starting point with clear pronunciation",
    },
    {
      code: "Italian",
      name: "Italian",
      flag: "🇮🇹",
      difficulty: "Beginner Friendly",
      learners: "65M+",
      description: "Beautiful sounds and logical grammar",
    },
    {
      code: "French",
      name: "French",
      flag: "🇫🇷",
      difficulty: "Intermediate",
      learners: "280M+",
      description: "Elegant language of culture and cuisine",
    },
    {
      code: "German",
      name: "German",
      flag: "🇩🇪",
      difficulty: "Intermediate",
      learners: "100M+",
      description: "Logical structure and rich vocabulary",
    },
  ];

  // Load available decks
  const loadAvailableDecks = async () => {
    setLoadingDecks(true);
    try {
      const decks = await flowService.executeScript(SCRIPTS.GET_ALL_DECKS);
      console.log('Available decks:', decks);
      setAvailableDecks(decks || []);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoadingDecks(false);
    }
  };

  // Load cards for a specific deck
  const loadDeckCards = async (deckId: number) => {
    try {
      const cards = await flowService.executeScript(SCRIPTS.GET_CARDS_BY_DECK, [deckId]);
      console.log('Deck cards:', cards);
      setDeckCards(cards || []);
      return cards || [];
    } catch (error) {
      console.error('Failed to load deck cards:', error);
      setDeckCards([]);
      return [];
    }
  };

  // Get deck statistics (card count and languages)
  const getDeckStats = (deckId: number) => {
    // Return cached stats if available
    if (deckStats[deckId]) {
      return deckStats[deckId];
    }
    
    // Fallback to computing from loaded data (should be rare)
    const cards = deckCards.filter(card => card.deckId === deckId);
    const cardCount = cards.length;
    const languages = Array.from(new Set(cards.map(card => card.languagePair))).sort();
    
    return { cardCount, languages };
  };

  // Load all deck cards when deck browser opens
  const loadAllDeckCards = async () => {
    if (availableDecks.length === 0) return;
    
    try {
      // Load cards for all decks and compute statistics
      const allCards: any[] = [];
      const statsMap: {[key: number]: {cardCount: number, languages: string[]}} = {};
      
      for (const deck of availableDecks) {
        console.log(`Loading cards for deck ${deck.id}: ${deck.concept}`);
        const deckId = Number(deck.id); // Ensure it's a number
        console.log(`Converted deck ID to number: ${deckId} (type: ${typeof deckId})`);
        const cards = await flowService.executeScript(SCRIPTS.GET_CARDS_BY_DECK, [deckId]);
        
        if (cards && Array.isArray(cards)) {
          // Add deck ID to each card for easier filtering
          const cardsWithDeckId = cards.map((card: any) => ({ ...card, deckId: deck.id }));
          allCards.push(...cardsWithDeckId);
          
          // Compute stats for this deck
          const cardCount = cards.length;
          
          // Get unique languages (not language pairs)
          const allLanguages = new Set<string>();
          cards.forEach((card: any) => {
            allLanguages.add(card.frontLanguage);
            allLanguages.add(card.backLanguage);
          });
          const uniqueLanguages = Array.from(allLanguages).sort();
          
          statsMap[deck.id] = { cardCount, languages: uniqueLanguages };
          console.log(`Deck ${deck.id} (${deck.concept}): ${cardCount} cards, ${uniqueLanguages.length} languages (${uniqueLanguages.join(', ')})`);
        } else {
          // No cards for this deck
          statsMap[deck.id] = { cardCount: 0, languages: [] };
          console.log(`Deck ${deck.id} (${deck.concept}): No cards found`);
        }
      }
      
      setDeckCards(allCards);
      setDeckStats(statsMap);
      console.log('All deck cards loaded:', allCards.length, 'total cards');
      console.log('Deck statistics computed:', statsMap);
    } catch (error) {
      console.error('Failed to load all deck cards:', error);
    }
  };

  // Load queue data
  const loadQueueData = async () => {
    if (!userAddress || !profile) return;
    
    try {
      console.log('Loading queue data for:', userAddress);
      const queue = await flowService.executeScript(SCRIPTS.GET_LEITNER_QUEUE, [userAddress]);
      console.log('Queue data:', queue);
      setQueueData(queue);
    } catch (error) {
      console.error('Failed to load queue data:', error);
      // Don't fail if queue loading fails
    }
  };

  // Load decks when deck browser opens
  useEffect(() => {
    if (showDeckBrowser && availableDecks.length === 0 && !loadingDecks) {
      loadAvailableDecks();
    }
    
    // Clear data when modal closes
    if (!showDeckBrowser) {
      setDeckCards([]);
      setDeckStats({});
    }
  }, [showDeckBrowser]);

  // Load all cards after decks are loaded
  useEffect(() => {
    if (showDeckBrowser && availableDecks.length > 0 && deckCards.length === 0) {
      loadAllDeckCards();
    }
  }, [showDeckBrowser, availableDecks]);

  // Load queue data when profile is available
  useEffect(() => {
    if (profile && userAddress && !queueData) {
      loadQueueData();
    }
  }, [profile, userAddress]);

  // Toggle language selection
  const toggleLanguage = (langCode: string) => {
    // Don't allow deselecting the primary language
    if (langCode === profile?.primaryLanguage) {
      return;
    }
    
    setSelectedLanguages((prev) =>
      prev.includes(langCode)
        ? prev.filter((code) => code !== langCode)
        : [...prev, langCode]
    );
  };

  // Add cards to user's Leitner system
  const addCardsToLeitnerSystem = async () => {
    if (!selectedDeck || selectedLanguages.length < 2) return;

    setAddingCards(true);
    try {
      console.log('Adding cards from deck', selectedDeck.id, 'for languages:', selectedLanguages);
      
      // Convert deck ID to number to ensure proper UInt64 handling
      await flowService.sendTransaction(TRANSACTIONS.ADD_LEITNER_CARDS, [
        Number(selectedDeck.id),
        selectedLanguages
      ]);

      console.log('Cards added successfully');
      
      // Reset state
      setShowLanguageModal(false);
      setSelectedDeck(null);
      setSelectedLanguages([]);
      setShowDeckBrowser(false);
      
      // Refresh data and redirect to learn page
      await loadUserData();
      router.push('/learn');
      
    } catch (error) {
      console.error('Failed to add cards:', error);
    } finally {
      setAddingCards(false);
    }
  };

  // Select deck and show language modal
  const selectDeck = async (deck: Deck) => {
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Polyglot
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Language Learning with Spaced Repetition
          </p>
          <p className="text-gray-500 mb-8">
            Connect your wallet to start learning languages with blockchain-powered spaced repetition
          </p>
          <button
            onClick={() => setShowAuthFlow(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Polyglot Dashboard</h1>
              <p className="text-gray-600">Master languages with spaced repetition</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDeckBrowser(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <Library className="w-4 h-4" />
                Browse Decks
              </button>
              <button
                onClick={() => router.push('/learn')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Learning
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
              <div>
                    <div className="text-sm font-medium text-gray-900">Wallet Address</div>
                    <div className="text-xs text-gray-500">Your Flow blockchain address</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="font-mono text-sm text-gray-800 flex-1 truncate">
                  {userAddress}
                  </code>
                  <button
                    onClick={() => userAddress && navigator.clipboard.writeText(userAddress)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Network */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Network className="w-4 h-4 text-green-600" />
              </div>
              <div>
                    <div className="text-sm font-medium text-gray-900">Network</div>
                    <div className="text-xs text-gray-500">Blockchain network</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">{network}</span>
                </div>
              </div>

              {/* Contract Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                    <div className="text-sm font-medium text-gray-900">Contract Address</div>
                    <div className="text-xs text-gray-500">LeitnerLang smart contract</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="font-mono text-xs text-gray-600 flex-1 truncate">
                    {contractAddress}
                  </code>
                  <button
                    onClick={() => contractAddress && navigator.clipboard.writeText(contractAddress)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy contract address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* COA Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                    <div className="text-sm font-medium text-gray-900">COA Address</div>
                    <div className="text-xs text-gray-500">Cadence Owned Account</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="font-mono text-xs text-gray-600 flex-1 truncate">
                    {coaAddress || 'Not available'}
                  </code>
                  {coaAddress && (
                    <button
                      onClick={() => navigator.clipboard.writeText(coaAddress)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy COA address"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Profile Section */}
        {profile ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-900">{profile.streakDays || 0} day streak</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.totalCards || 0}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.totalReviews || 0}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.cardsDueForReview || 0}</div>
                <div className="text-sm text-gray-600">Due Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile.streakDays || 0}</div>
                <div className="text-sm text-gray-600">Streak Days</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Set Up Your Profile</h2>
            <p className="text-gray-600 mb-4">Get started with your language learning journey</p>
            <button
              onClick={() => setShowSetupProfile(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Setup Profile
            </button>
          </div>
        )}

        {/* Quick Actions - Responsive sizing based on queue data availability */}
        <div className={`grid grid-cols-1 gap-6 mb-8 ${queueData ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-3'}`}>
          <button
            onClick={() => router.push('/learn')}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group ${
              queueData ? 'p-6' : 'p-8 lg:p-10'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors ${
                queueData ? 'w-12 h-12' : 'w-16 h-16 lg:w-20 lg:h-20'
              }`}>
                <Play className={`text-green-600 ${queueData ? 'w-6 h-6' : 'w-8 h-8 lg:w-10 lg:h-10'}`} />
              </div>
              <ChevronRight className={`text-gray-400 group-hover:text-gray-600 transition-colors ${
                queueData ? 'w-5 h-5' : 'w-6 h-6 lg:w-7 lg:h-7'
              }`} />
            </div>
            <h3 className={`font-semibold text-gray-900 mb-2 ${queueData ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
              Start Learning
            </h3>
            <p className={`text-gray-600 ${queueData ? 'text-sm' : 'text-base lg:text-lg'}`}>
              Review your flashcards and progress through levels
            </p>
          </button>

          <button
            onClick={() => setShowDeckBrowser(true)}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group ${
              queueData ? 'p-6' : 'p-8 lg:p-10'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors ${
                queueData ? 'w-12 h-12' : 'w-16 h-16 lg:w-20 lg:h-20'
              }`}>
                <Library className={`text-blue-600 ${queueData ? 'w-6 h-6' : 'w-8 h-8 lg:w-10 lg:h-10'}`} />
              </div>
              <ChevronRight className={`text-gray-400 group-hover:text-gray-600 transition-colors ${
                queueData ? 'w-5 h-5' : 'w-6 h-6 lg:w-7 lg:h-7'
              }`} />
            </div>
            <h3 className={`font-semibold text-gray-900 mb-2 ${queueData ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
              Browse Decks
            </h3>
            <p className={`text-gray-600 ${queueData ? 'text-sm' : 'text-base lg:text-lg'}`}>
              Explore available vocabulary decks and add cards
            </p>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group ${
              queueData ? 'p-6' : 'p-8 lg:p-10'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors ${
                queueData ? 'w-12 h-12' : 'w-16 h-16 lg:w-20 lg:h-20'
              }`}>
                <BarChart3 className={`text-purple-600 ${queueData ? 'w-6 h-6' : 'w-8 h-8 lg:w-10 lg:h-10'}`} />
              </div>
              <ChevronRight className={`text-gray-400 group-hover:text-gray-600 transition-colors ${
                queueData ? 'w-5 h-5' : 'w-6 h-6 lg:w-7 lg:h-7'
              }`} />
            </div>
            <h3 className={`font-semibold text-gray-900 mb-2 ${queueData ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
              View Progress
            </h3>
            <p className={`text-gray-600 ${queueData ? 'text-sm' : 'text-base lg:text-lg'}`}>
              Check your detailed learning statistics
            </p>
          </button>
        </div>

        {/* Leitner Queue Schedule - Full Width */}
        {queueData && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Leitner Queue Schedule
            </h2>
            
            {/* Current Status */}
            <div className="mb-6 p-6 rounded-lg border" style={{
              backgroundColor: queueData.status === 'Day Complete' ? '#f0fdf4' : queueData.status === 'Light Load' ? '#eff6ff' : queueData.status === 'Normal Load' ? '#fef3c7' : '#fef2f2',
              borderColor: queueData.status === 'Day Complete' ? '#bbf7d0' : queueData.status === 'Light Load' ? '#bfdbfe' : queueData.status === 'Normal Load' ? '#fde68a' : '#fecaca'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Today's Status: {queueData.status}</h3>
                  <p className="text-gray-600 mt-2">{queueData.recommendation}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900">{queueData.currentDayCount}</div>
                  <div className="text-gray-600">Cards Due</div>
                </div>
              </div>
            </div>

            {/* Queue Visualization - Enhanced for full width */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">32-Day Queue Overview</h3>
              <div 
                className="grid gap-2 max-w-none"
                style={{ 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                  maxWidth: '100%'
                }}
              >
                {queueData.queueStructure && queueData.queueStructure.map((dayInfo: any, index: number) => {
                  const dayIndex = dayInfo.day;
                  const isToday = dayInfo.isCurrentDay;
                  const cardCount = dayInfo.cardCount || 0;
                  const hasCards = cardCount > 0;
                  const isLeitnerInterval = [1, 2, 4, 8, 16, 32].includes(dayIndex);
                  const isEstimated = dayInfo.isEstimated;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`relative h-20 rounded border flex flex-col items-center justify-center text-xs font-medium transition-all hover:scale-105 ${
                        isToday 
                          ? hasCards 
                            ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-md' 
                            : 'bg-green-100 border-green-300 text-green-900 shadow-md'
                          : hasCards
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      title={`Day ${dayIndex}${isToday ? ' (Today)' : ''}${isEstimated ? ' (estimated)' : ''}: ${cardCount} cards${isLeitnerInterval ? ' - Leitner interval day' : ''}`}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium">{dayIndex === 0 ? 'Today' : `+${dayIndex}`}</div>
                        <div className="text-sm font-bold">
                          {cardCount > 0 ? cardCount : '0'}
                        </div>
                        {isEstimated && cardCount > 0 && (
                          <div className="text-xs opacity-60">est</div>
                        )}
                      </div>
                      
                      {/* Leitner intervals indicators */}
                      {isLeitnerInterval && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white" 
                             title={`Leitner interval: ${dayIndex} days`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend - Enhanced for better visibility */}
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Today (has cards)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Today (complete)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded"></div>
                  <span>Future days (with cards)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                  <span>Empty days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span>Leitner intervals (1,2,4,8,16,32 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm italic">est</span>
                  <span>Estimated counts (based on today's cards)</span>
                </div>
              </div>
            </div>

            {/* Queue Analytics - Enhanced for full width */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Queue Health</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Is Complete:</span>
                    <span className={`font-medium ${queueData.isLeitnerDayComplete ? 'text-green-600' : 'text-orange-600'}`}>
                      {queueData.isLeitnerDayComplete ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cards:</span>
                    <span className="font-medium text-gray-900">{queueData.totalCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews:</span>
                    <span className="font-medium text-gray-900">{queueData.totalReviews}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Queue Statistics</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled Cards:</span>
                    <span className="font-medium text-gray-900">{queueData.totalScheduledCards || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Days:</span>
                    <span className="font-medium text-gray-900">{queueData.scheduledDays || 0}/32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-medium text-gray-900">{Math.round(queueData.queueEfficiency || 0)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Next Action</h4>
                <p className="text-sm text-gray-600 mb-3">{queueData.nextAction}</p>
                
                {queueData.averageCardsPerActiveDay && queueData.averageCardsPerActiveDay > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg per active day:</span>
                      <span className="font-medium text-gray-900">{Math.round(queueData.averageCardsPerActiveDay * 10) / 10}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-3">
            <button
                    onClick={() => router.push('/learn')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                    Start Learning
            </button>
            <button
                    onClick={() => setShowDeckBrowser(true)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
                    Add More Cards
            </button>
          </div>
              </div>
            </div>
          </div>
        )}

        {/* Deck Browser Modal */}
        {showDeckBrowser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Browse Decks</h2>
                  <button
                    onClick={() => {
                      setShowDeckBrowser(false);
                      setAvailableDecks([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Select a deck to add cards to your learning system</p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingDecks && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading decks...</span>
                  </div>
                )}

                {!loadingDecks && availableDecks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No decks found</p>
                    <button
                      onClick={loadAvailableDecks}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Retry Loading
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableDecks.map((deck) => {
                    const { cardCount, languages } = getDeckStats(deck.id);
                    return (
                      <div
                        key={deck.id}
                        onClick={() => selectDeck(deck)}
                        className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">📚</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 capitalize mb-1">{deck.concept}</h3>
                            <p className="text-sm text-gray-600 mb-3">{deck.meaning}</p>
                            
                            {/* Card Count and Languages - More Prominent */}
                            <div className="mb-3">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium text-blue-700">📝</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {cardCount} cards
                                  </span>
                                </div>
                                {languages.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium text-green-700">🌍</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {languages.length} languages
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Show actual languages */}
                              {languages.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {languages.slice(0, 4).map((language) => (
                                    <span key={language} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                      {language}
                                    </span>
                                  ))}
                                  {languages.length > 4 && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                      +{languages.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Metadata */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                ID: {deck.id}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                {Math.round(deck.daysSinceCreation)} days old
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language Selection Modal */}
        {showLanguageModal && selectedDeck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">
                      {selectedDeck.concept}
                    </h2>
                    <p className="text-gray-600">{selectedDeck.meaning}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLanguageModal(false);
                      setSelectedDeck(null);
                      setSelectedLanguages([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Languages for Card Pairs
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose languages to create flashcard pairs. Cards will only be added if both languages exist in the deck.
                  </p>
                  
                  <div className="space-y-3">
                    {languages.map((lang) => {
                      const isPrimaryLanguage = profile?.primaryLanguage === lang.code;
                      const isSelected = selectedLanguages.includes(lang.code);
                      
                      return (
                        <div
                          key={lang.code}
                          onClick={() => !isPrimaryLanguage && toggleLanguage(lang.code)}
                          className={`p-4 rounded-lg transition-all border ${
                            isPrimaryLanguage
                              ? "ring-2 ring-green-500 border-green-200 bg-green-50 cursor-not-allowed"
                              : isSelected
                                ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50 cursor-pointer"
                                : "border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{lang.name}</h4>
                                {isPrimaryLanguage && (
                                  <>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                      Primary
                                    </span>
                                    <Check className="w-4 h-4 text-green-600" />
                                  </>
                                )}
                                {!isPrimaryLanguage && isSelected && (
                                  <Check className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {isPrimaryLanguage ? "Your primary language (always included)" : lang.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Show available card count */}
                {deckCards.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Available Cards in This Deck
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      This deck contains {deckCards.length} cards with the following language pairs:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(deckCards.map(card => card.languagePair))).map(pair => (
                        <span key={pair} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {pair}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowLanguageModal(false);
                      setSelectedDeck(null);
                      setSelectedLanguages([]);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCardsToLeitnerSystem}
                    disabled={selectedLanguages.length < 2 || addingCards}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {addingCards ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding Cards...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Cards to Learning
                      </>
                    )}
                  </button>
                </div>

                {selectedLanguages.length === 1 && (
                  <p className="text-center text-sm text-orange-600 mt-2">
                    Select at least 2 languages to create language pairs
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Setup Profile Modal (existing) */}
        {showSetupProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set Up Your Profile</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const primaryLanguage = formData.get('primaryLanguage') as string;
                
                if (primaryLanguage) {
                  await setupProfile(primaryLanguage);
                  setShowSetupProfile(false);
                }
              }}>
                <div className="mb-4">
                  <label htmlFor="primaryLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Language
                  </label>
                  <select
                    id="primaryLanguage"
                    name="primaryLanguage"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a language</option>
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSetupProfile(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    {loading ? 'Setting up...' : 'Set Up Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Deck Modal (existing functionality) */}
        {showCreateDeck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Deck</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const concept = formData.get('concept') as string;
                const meaning = formData.get('meaning') as string;
                
                if (concept) {
                  await createDeck(concept);
                  setShowCreateDeck(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concept
                  </label>
                  <input
                    name="concept"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., greetings, numbers, food"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meaning
                  </label>
                  <textarea
                    name="meaning"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this deck teaches"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateDeck(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Deck'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 