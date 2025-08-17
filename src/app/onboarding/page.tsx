"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLeitnerLang } from "../../hooks/useLeitnerLang";
import {
  Wallet,
  Globe,
  BookOpen,
  ChevronRight,
  Check,
  Star,
  Users,
  Trophy,
  Zap,
  Shield,
  ArrowRight,
  User,
} from "lucide-react";

import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";

// Type definitions
interface WalletProfile {
  address: string;
  network: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
  difficulty: string;
  learners: string;
  description: string;
}

interface Deck {
  id: string;
  name: string;
  icon: string;
  cards: number;
  description: string;
  essential: boolean;
}

type OnboardingStep = "welcome" | "connect" | "languages" | "decks" | "summary";

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const { primaryWallet } = useDynamicContext();
  const isAuthenticated = !!primaryWallet;
  const { setupProfile, loading, error } = useLeitnerLang();

  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<WalletProfile | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && primaryWallet && currentStep === 'connect') {
      setTimeout(() => {
        setCurrentStep('languages');
      }, 1500);
    }
  }, [isAuthenticated, primaryWallet, currentStep]);

  const languages: Language[] = [
    {
      code: "es",
      name: "Spanish",
      flag: "🇪🇸",
      difficulty: "Beginner Friendly",
      learners: "500M+",
      description: "Perfect starting point with clear pronunciation",
    },
    {
      code: "it",
      name: "Italian",
      flag: "🇮🇹",
      difficulty: "Beginner Friendly",
      learners: "65M+",
      description: "Beautiful sounds and logical grammar",
    },
    {
      code: "fr",
      name: "French",
      flag: "🇫🇷",
      difficulty: "Intermediate",
      learners: "280M+",
      description: "Elegant language of culture and cuisine",
    },
  ];

  const decks: Deck[] = [
    {
      id: "greetings",
      name: "Greetings & Basics",
      icon: "👋",
      cards: 20,
      description: "Hello, goodbye, please, thank you",
      essential: true,
    },
    {
      id: "numbers",
      name: "Numbers & Time",
      icon: "🔢",
      cards: 25,
      description: "1-100, days, months, telling time",
      essential: true,
    },
    {
      id: "food",
      name: "Food & Dining",
      icon: "🍕",
      cards: 30,
      description: "Restaurant vocabulary, ingredients, cooking",
      essential: false,
    },
    {
      id: "travel",
      name: "Travel & Places",
      icon: "✈️",
      cards: 28,
      description: "Directions, transportation, accommodations",
      essential: false,
    },
    {
      id: "family",
      name: "Family & People",
      icon: "👨‍👩‍👧‍👦",
      cards: 22,
      description: "Relationships, descriptions, emotions",
      essential: true,
    },
    {
      id: "verbs",
      name: "Common Verbs",
      icon: "⚡",
      cards: 35,
      description: "Essential action words and conjugations",
      essential: true,
    },
  ];

  const handleWalletConnect = () => {
    setCurrentStep('connect');
  };

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(langCode)
        ? prev.filter((code) => code !== langCode)
        : [...prev, langCode]
    );
  };

  const toggleDeck = (deckId: string) => {
    setSelectedDecks((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  // Welcome Screen
  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center text-white mb-12">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
              <Globe className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">LeitnerLang</h1>
            <p className="text-xl opacity-90 mb-2">Master Multiple Languages</p>
            <p className="text-lg opacity-75">
              With blockchain-powered learning
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Spaced Repetition</h3>
                <p className="text-sm opacity-80">
                  Learn efficiently with proven SRS methods
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Multi-Language Learning</h3>
                <p className="text-sm opacity-80">
                  Connect romance languages for faster progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Earn as You Learn</h3>
                <p className="text-sm opacity-80">
                  Get rewards and NFT certificates on Flow
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep("connect")}
            className="w-full bg-white text-blue-600 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Wallet Connection Screen
  if (currentStep === 'connect') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600">
                Secure your progress and earn rewards on the Flow blockchain
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Why connect a wallet?</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Own your learning progress forever
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Earn FLOW tokens for daily streaks
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Collect NFT certificates for achievements
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Join leaderboards and competitions
                    </li>
                  </ul>
                </div>

                {/* Dynamic Widget */}
                <div className="dynamic-widget-container">
                  <DynamicWidget />
                </div>

                <p className="text-center text-sm text-gray-500">
                  We support all major Flow wallets via Dynamic
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connected!</h3>
                <p className="text-gray-600 mb-4 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {primaryWallet?.address}
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to language selection...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Language Selection Screen
  if (currentStep === "languages") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Languages</h2>
            <p className="text-lg text-gray-600 mb-2">
              Select 1-3 romance languages to learn
            </p>
            <p className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full inline-block">
              English will be your base language
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 border ${
                  selectedLanguages.includes(lang.code)
                    ? "ring-2 ring-blue-500 border-blue-200 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{lang.flag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {lang.name}
                      </h3>
                      {selectedLanguages.includes(lang.code) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          lang.difficulty === "Beginner Friendly"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {lang.difficulty}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {lang.learners}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{lang.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep("connect")}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors border border-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep("decks")}
              disabled={selectedLanguages.length === 0}
              className="flex-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Deck Selection Screen
  if (currentStep === "decks") {
    const essentialDecks = decks.filter((deck) => deck.essential);
    const optionalDecks = decks.filter((deck) => !deck.essential);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Decks</h2>
            <p className="text-lg text-gray-600 mb-2">
              Start with essential decks, add more later
            </p>
            <p className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full inline-block">
              Learning{" "}
              {selectedLanguages
                .map((code) => languages.find((l) => l.code === code)?.name)
                .join(", ")}
            </p>
          </div>

          <div className="space-y-6">
            {/* Essential Decks */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Essential Decks
              </h3>
              <div className="space-y-3">
                {essentialDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => toggleDeck(deck.id)}
                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 border ${
                      selectedDecks.includes(deck.id)
                        ? "ring-2 ring-blue-500 border-blue-200 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{deck.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {deck.name}
                          </h4>
                          {selectedDecks.includes(deck.id) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {deck.description}
                        </p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {deck.cards} cards
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Decks */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Optional Decks</h3>
              <div className="space-y-3">
                {optionalDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => toggleDeck(deck.id)}
                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 border ${
                      selectedDecks.includes(deck.id)
                        ? "ring-2 ring-blue-500 border-blue-200 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl opacity-60">{deck.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {deck.name}
                          </h4>
                          {selectedDecks.includes(deck.id) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {deck.description}
                        </p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {deck.cards} cards
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setCurrentStep("languages")}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors border border-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep("summary")}
              disabled={selectedDecks.length === 0}
              className="flex-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary/Success Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're All Set!
          </h2>
          <p className="text-gray-600 mb-8">
            Ready to start your multilingual journey
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Learning Languages:
              </h3>
              <div className="flex gap-2 justify-center flex-wrap">
                {selectedLanguages.map((code) => {
                  const lang = languages.find((l) => l.code === code);
                  return (
                    <span
                      key={code}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {lang?.flag} {lang?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Starting Decks:
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDecks.length} decks •{" "}
                {selectedDecks.reduce((total, deckId) => {
                  const deck = decks.find((d) => d.id === deckId);
                  return total + (deck?.cards || 0);
                }, 0)}{" "}
                total cards
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={async () => {
                // Save user's selections and set up profile on-chain
                const onboardingData = {
                  wallet: userProfile,
                  languages: selectedLanguages,
                  decks: selectedDecks,
                };

                try {
                  console.log("User selections:", onboardingData);
                  
                  // Set up profile on-chain with primary language
                  if (selectedLanguages.length > 0) {
                    const primaryLanguage = selectedLanguages[0]; // Use first selected language as primary
                    await setupProfile(primaryLanguage);
                  }
                  
                  // Redirect to main dashboard
                  router.push("/");
                } catch (error) {
                  console.error("Error saving onboarding data:", error);
                }
              }}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookOpen className="w-5 h-5" />
              {loading ? "Setting up profile..." : "Start Learning"}
            </button>
            
            <button
              onClick={async () => {
                // Save user's selections
                const onboardingData = {
                  wallet: userProfile,
                  languages: selectedLanguages,
                  decks: selectedDecks,
                };

                try {
                  console.log("User selections:", onboardingData);
                  // Redirect to profile page
                  router.push("/profile");
                } catch (error) {
                  console.error("Error saving onboarding data:", error);
                }
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-300"
            >
              <User className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
