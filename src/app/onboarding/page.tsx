"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

// Mock wallet connection - replace with Dynamic later
// const mockConnectWallet = (): Promise<WalletProfile> => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         address: "0x1234...5678",
//         network: "Flow Mainnet",
//       });
//     }, 2000);
//   });
// };

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
    const { primaryWallet, isAuthenticated } = useDynamicContext();

//   const [isConnecting, setIsConnecting] = useState<boolean>(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center text-white mb-12">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
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
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
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
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
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
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
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
   // Wallet Connection Screen
  if (currentStep === 'connect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600">
                Secure your progress and earn rewards on the Flow blockchain
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-800">Why connect a wallet?</span>
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

                {/* Dynamic Widget - remove the DynamicContextProvider wrapper */}
                <div className="dynamic-widget-container">
                  <DynamicWidget />
                </div>

                <p className="text-center text-sm text-gray-500">
                  We support all major Flow wallets via Dynamic
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Connected!</h3>
                <p className="text-gray-600 mb-4">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">Choose Your Languages</h2>
            <p className="text-lg opacity-90 mb-1">
              Select 1-3 romance languages to learn
            </p>
            <p className="text-sm opacity-75">
              English will be your base language
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedLanguages.includes(lang.code)
                    ? "ring-4 ring-yellow-300 shadow-lg scale-105"
                    : "hover:shadow-md hover:scale-102"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{lang.flag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {lang.name}
                      </h3>
                      {selectedLanguages.includes(lang.code) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
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
              className="flex-1 bg-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep("decks")}
              disabled={selectedLanguages.length === 0}
              className="flex-2 bg-white text-purple-600 py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-600 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">Choose Your Decks</h2>
            <p className="text-lg opacity-90 mb-1">
              Start with essential decks, add more later
            </p>
            <p className="text-sm opacity-75">
              Learning{" "}
              {selectedLanguages
                .map((code) => languages.find((l) => l.code === code)?.name)
                .join(", ")}
            </p>
          </div>

          <div className="space-y-6">
            {/* Essential Decks */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                Essential Decks
              </h3>
              <div className="space-y-3">
                {essentialDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => toggleDeck(deck.id)}
                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                      selectedDecks.includes(deck.id)
                        ? "ring-4 ring-yellow-300 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{deck.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">
                            {deck.name}
                          </h4>
                          {selectedDecks.includes(deck.id) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {deck.description}
                        </p>
                        <span className="text-xs text-gray-500">
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
              <h3 className="text-white font-semibold mb-3">Optional Decks</h3>
              <div className="space-y-3">
                {optionalDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => toggleDeck(deck.id)}
                    className={`bg-white/90 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                      selectedDecks.includes(deck.id)
                        ? "ring-4 ring-yellow-300 shadow-lg bg-white"
                        : "hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{deck.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">
                            {deck.name}
                          </h4>
                          {selectedDecks.includes(deck.id) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {deck.description}
                        </p>
                        <span className="text-xs text-gray-500">
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
              className="flex-1 bg-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep("summary")}
              disabled={selectedDecks.length === 0}
              className="flex-2 bg-white text-green-600 py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            You're All Set!
          </h2>
          <p className="text-gray-600 mb-6">
            Ready to start your multilingual journey
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Learning Languages:
              </h3>
              <div className="flex gap-2 justify-center">
                {selectedLanguages.map((code) => {
                  const lang = languages.find((l) => l.code === code);
                  return (
                    <span
                      key={code}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {lang?.flag} {lang?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
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

          <button
            onClick={async () => {
              // Save user's selections (replace with your actual API call)
              const onboardingData = {
                wallet: userProfile,
                languages: selectedLanguages,
                decks: selectedDecks,
              };

              try {
                // Example API call to save onboarding data
                // await fetch('/api/users/onboarding', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(onboardingData)
                // });

                console.log("User selections:", onboardingData);

                // Redirect to profile page
                router.push("/profile");
              } catch (error) {
                console.error("Error saving onboarding data:", error);
                // Handle error (show toast, etc.)
              }
            }}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Enter LeitnerLang
          </button>
        </div>
      </div>
    </div>
  );
}
