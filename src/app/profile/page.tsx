'use client'

import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { flowService, SCRIPTS } from '../../lib/flow';
import { useLeitnerLang } from '../../hooks/useLeitnerLang';
import { 
  User, 
  Wallet, 
  Calendar,
  Copy,
  BookOpen
} from 'lucide-react';

export default function ProfilePage() {
  const { primaryWallet } = useDynamicContext();
  const { setupProfile, loading: hookLoading, error: hookError } = useLeitnerLang();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Load real profile data from contract
  useEffect(() => {
    const loadProfile = async () => {
      if (!primaryWallet?.address) return;
      
      setLoading(true);
      try {
        console.log('Loading profile for:', primaryWallet.address);
        
        // Get FCL user address for consistency
        const fclUserAddress = await flowService.getCurrentUserAddress();
        const flowAddress = fclUserAddress || flowService.normalizeAddress(primaryWallet.address);
        console.log('Using Flow address for profile page:', flowAddress);
        
        const profile = await flowService.executeScript(SCRIPTS.GET_PROFILE, [flowAddress]);
        console.log('Profile data:', profile);
        
        setProfileData(profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [primaryWallet?.address]);

  const copyAddress = () => {
    if (profileData?.userAddress) {
      navigator.clipboard.writeText(profileData.userAddress);
      alert('Address copied to clipboard!');
    }
  };

  if (!primaryWallet) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-5rem)]">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-5rem)]">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Profile...</h2>
          <p className="text-gray-600">Fetching your data from the Flow blockchain</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'No profile data found. Please set up your profile first.'}</p>
            <button 
              onClick={() => setShowSetupModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Set Up Profile
            </button>
          </div>

          {/* Profile Setup Modal */}
          {showSetupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Set Up Your Profile</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const primaryLanguage = formData.get('primaryLanguage') as string;
                  
                  if (primaryLanguage) {
                    await setupProfile(primaryLanguage);
                    setShowSetupModal(false);
                    // Reload the page to fetch the new profile
                    window.location.reload();
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
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                    </select>
                  </div>

                  {hookError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{hookError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSetupModal(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={hookLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      {hookLoading ? 'Setting up...' : 'Set Up Profile'}
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

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-200">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData.primaryLanguage} Learner
              </h1>
              <p className="text-sm text-gray-600">
                Learning since {new Date(parseFloat(profileData.createdAt) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Primary Language</label>
              <div className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                {profileData.primaryLanguage}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Created Date</label>
              <div className="flex items-center gap-2 text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                {new Date(parseFloat(profileData.createdAt) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Flow Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-900 border border-gray-200">
                  {profileData.userAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Network</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                Flow Testnet
              </div>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{profileData.totalCards}</div>
              <div className="text-sm text-blue-700">Total Cards</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-900">{profileData.totalReviews}</div>
              <div className="text-sm text-green-700">Total Reviews</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-900">{profileData.streakDays}</div>
              <div className="text-sm text-orange-700">Day Streak</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              <strong>Status:</strong> {profileData.profileStatus}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Cards Due for Review:</strong> {profileData.cardsDueForReview}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}