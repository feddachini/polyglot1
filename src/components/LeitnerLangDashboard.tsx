'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useLeitnerLang } from '../hooks/useLeitnerLang';

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

  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showSetupProfile, setShowSetupProfile] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            LeitnerLang
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">LeitnerLang Dashboard</h1>
          
          {/* Connection Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700 mb-1">Network</p>
              <p className="text-gray-900">{network}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700 mb-1">Your Address</p>
              <p className="text-gray-900 truncate font-mono text-xs">{userAddress}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700 mb-1">Contract</p>
              <p className="text-gray-900 truncate font-mono text-xs">{contractAddress}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700 mb-1">COA Address</p>
              <p className="text-gray-900 truncate font-mono text-xs">{coaAddress}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fundAccount}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Get Testnet FLOW
            </button>
            {!profile && (
              <button
                onClick={() => setShowSetupProfile(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Setup Profile
              </button>
            )}
            <button
              onClick={() => setShowCreateDeck(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Create Deck
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Start Learning
            </button>
            <button
              onClick={loadUserData}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Profile */}
        {profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-semibold text-gray-900">Primary Language:</span> {profile.primaryLanguage}</p>
              <p className="text-gray-700"><span className="font-semibold text-gray-900">Created:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Decks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Decks</h2>
            <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">{decks.length} decks</span>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-3">Loading...</p>
            </div>
          )}

          {!loading && decks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No decks yet. Create your first deck to get started!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div key={deck.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{deck.concept}</h3>
                <p className="text-sm text-gray-600 mb-4">{deck.cardCount} cards</p>
                <button
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setShowCreateCard(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Add Card
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {showSetupProfile && (
          <ProfileSetupModal
            onClose={() => setShowSetupProfile(false)}
            onSubmit={setupProfile}
            loading={loading}
          />
        )}

        {showCreateDeck && (
          <CreateDeckModal
            onClose={() => setShowCreateDeck(false)}
            onSubmit={createDeck}
            loading={loading}
          />
        )}

        {showCreateCard && selectedDeckId && (
          <CreateCardModal
            deckId={selectedDeckId}
            onClose={() => {
              setShowCreateCard(false);
              setSelectedDeckId('');
            }}
            onSubmit={createCard}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Profile Setup Modal
function ProfileSetupModal({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (language: string) => void;
  loading: boolean;
}) {
  const [language, setLanguage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (language.trim()) {
      onSubmit(language.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Setup Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Language
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g., English"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Deck Modal
function CreateDeckModal({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (concept: string) => void;
  loading: boolean;
}) {
  const [concept, setConcept] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (concept.trim()) {
      onSubmit(concept.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Deck</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deck Concept
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Spanish Basics"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Card Modal
function CreateCardModal({ deckId, onClose, onSubmit, loading }: {
  deckId: string;
  onClose: () => void;
  onSubmit: (deckId: string, front: string, back: string) => void;
  loading: boolean;
}) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onSubmit(deckId, front.trim(), back.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Card</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Front (Question)
            </label>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Hello"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Back (Answer)
            </label>
            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Hola"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 