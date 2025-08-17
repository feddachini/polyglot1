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
  const [queueData, setQueueData] = useState<any>(null);
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

        // Load queue data if profile exists
        if (profile) {
          try {
            const queue = await flowService.executeScript(SCRIPTS.GET_LEITNER_QUEUE, [flowAddress]);
            console.log('Queue data:', queue);
            setQueueData(queue);
          } catch (queueError) {
            console.error('Failed to load queue data:', queueError);
            // Don't fail the whole page if queue loading fails
          }
        }
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

        {/* Leitner Queue Schedule */}
        {queueData && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Leitner Queue Schedule
            </h2>
            
            {/* Current Status */}
            <div className="mb-6 p-4 rounded-lg border" style={{
              backgroundColor: queueData.status === 'Day Complete' ? '#f0fdf4' : queueData.status === 'Light Load' ? '#eff6ff' : queueData.status === 'Normal Load' ? '#fef3c7' : '#fef2f2',
              borderColor: queueData.status === 'Day Complete' ? '#bbf7d0' : queueData.status === 'Light Load' ? '#bfdbfe' : queueData.status === 'Normal Load' ? '#fde68a' : '#fecaca'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Today's Status: {queueData.status}</h3>
                  <p className="text-sm text-gray-600 mt-1">{queueData.recommendation}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{queueData.currentDayCount}</div>
                  <div className="text-sm text-gray-600">Cards Due</div>
                </div>
              </div>
            </div>

            {/* Queue Visualization */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">32-Day Queue Overview</h3>
              <div className="grid grid-cols-8 gap-2">
                {queueData.queueStructure && queueData.queueStructure.map((dayInfo: any, index: number) => {
                  const dayIndex = dayInfo.day;
                  const isToday = dayInfo.isCurrentDay;
                  const cardCount = dayInfo.cardCount || 0;
                  const hasCards = cardCount > 0;
                  const isLeitnerInterval = dayInfo.isLeitnerInterval;
                  const isEstimated = dayInfo.isEstimated;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`relative h-16 rounded border flex flex-col items-center justify-center text-xs font-medium ${
                        isToday 
                          ? hasCards 
                            ? 'bg-blue-100 border-blue-300 text-blue-900' 
                            : 'bg-green-100 border-green-300 text-green-900'
                          : hasCards
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      title={`Day ${dayIndex}${isToday ? ' (Today)' : ''}${isEstimated ? ' (estimated)' : ''}: ${cardCount} cards${isLeitnerInterval ? ' - Leitner interval day' : ''}`}
                    >
                      <div className="text-center">
                        <div className="text-xs">{dayIndex === 0 ? 'Today' : `+${dayIndex}`}</div>
                        <div className="text-xs font-bold">
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
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Today (has cards)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Today (complete)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded"></div>
                  <span>Future days (with cards)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                  <span>Empty days</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Leitner intervals (1,2,4,8,16,32 days)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs italic">est</span>
                  <span>Estimated counts (based on today's cards)</span>
                </div>
              </div>
            </div>

            {/* Queue Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Queue Health</h4>
                <div className="space-y-2 text-sm">
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

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Queue Statistics</h4>
                <div className="space-y-2 text-sm">
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

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Next Action</h4>
                <p className="text-sm text-gray-600">{queueData.nextAction}</p>
                
                {queueData.averageCardsPerActiveDay && queueData.averageCardsPerActiveDay > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg per active day:</span>
                      <span className="font-medium text-gray-900">{Math.round(queueData.averageCardsPerActiveDay * 10) / 10}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}