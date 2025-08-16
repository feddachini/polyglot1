'use client'

import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Trophy, 
  Calendar,
  Target,
  TrendingUp,
  Award,
  Settings,
  Bell,
  Check,
  BookOpen,
  Flame,
  Star,
  ChevronRight,
  Edit,
  Copy,
  ExternalLink,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';

// Type definitions
interface UserStats {
  totalCards: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  joinDate: string;
}

interface LanguageProgress {
  code: string;
  name: string;
  flag: string;
  progress: number;
  totalCards: number;
  masteredCards: number;
  level: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface NFTCertificate {
  id: string;
  title: string;
  description: string;
  image: string;
  mintDate: string;
  tokenId: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'achievements' | 'nfts' | 'settings'>('overview');

  // Mock user data - replace with real data from your API
  const userProfile = {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    displayName: 'Language Learner',
    avatar: null,
    joinDate: '2024-01-15',
    isOnboarded: true
  };

  const userStats: UserStats = {
    totalCards: 1247,
    completedToday: 23,
    currentStreak: 12,
    longestStreak: 45,
    totalStudyTime: 8640, // minutes
    joinDate: '2024-01-15'
  };

  const languageProgress: LanguageProgress[] = [
    {
      code: 'es',
      name: 'Spanish',
      flag: '🇪🇸',
      progress: 78,
      totalCards: 450,
      masteredCards: 351,
      level: 'Intermediate'
    },
    {
      code: 'it',
      name: 'Italian',
      flag: '🇮🇹',
      progress: 65,
      totalCards: 420,
      masteredCards: 273,
      level: 'Intermediate'
    },
    {
      code: 'fr',
      name: 'French',
      flag: '🇫🇷',
      progress: 45,
      totalCards: 377,
      masteredCards: 170,
      level: 'Beginner+'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: '👶',
      earned: true,
      earnedDate: '2024-01-15',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🗓️',
      earned: true,
      earnedDate: '2024-01-22',
      rarity: 'common'
    },
    {
      id: '3',
      title: 'Polyglot',
      description: 'Learn 3 languages simultaneously',
      icon: '🌍',
      earned: true,
      earnedDate: '2024-01-16',
      rarity: 'rare'
    },
    {
      id: '4',
      title: 'Speed Demon',
      description: 'Complete 100 cards in one session',
      icon: '⚡',
      earned: false,
      rarity: 'epic'
    },
    {
      id: '5',
      title: 'Perfectionist',
      description: 'Get 50 cards right in a row',
      icon: '🎯',
      earned: false,
      rarity: 'legendary'
    }
  ];

  const nftCertificates: NFTCertificate[] = [
    {
      id: '1',
      title: 'Spanish Basics Master',
      description: 'Completed all essential Spanish vocabulary',
      image: '🇪🇸',
      mintDate: '2024-01-20',
      tokenId: '#001'
    },
    {
      id: '2',
      title: 'Week 1 Champion',
      description: 'Perfect attendance for your first week',
      image: '🏆',
      mintDate: '2024-01-22',
      tokenId: '#005'
    }
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(userProfile.walletAddress);
    // You'd show a toast notification here
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{userStats.completedToday}</div>
          <div className="text-xs text-gray-500">cards completed</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{userStats.currentStreak}</div>
          <div className="text-xs text-gray-500">days in a row</div>
        </div>
      </div>

      {/* Recent Achievement */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌍</div>
          <div>
            <h3 className="font-semibold text-gray-800">Latest Achievement</h3>
            <p className="text-sm text-gray-600">Polyglot - Learn 3 languages simultaneously</p>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full mt-1 inline-block">Rare</span>
          </div>
        </div>
      </div>

      {/* Language Overview */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Language Progress</h3>
        <div className="space-y-3">
          {languageProgress.map((lang) => (
            <div key={lang.code} className="flex items-center gap-3">
              <div className="text-2xl">{lang.flag}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{lang.name}</span>
                  <span className="text-xs text-gray-500">{lang.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${lang.progress}%`}}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{lang.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProgressTab = () => (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Total Cards</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{userStats.totalCards}</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Study Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatStudyTime(userStats.totalStudyTime)}</div>
        </div>
      </div>

      {/* Detailed Language Progress */}
      <div className="space-y-4">
        {languageProgress.map((lang) => (
          <div key={lang.code} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{lang.flag}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{lang.name}</h3>
                <span className="text-sm text-gray-600">{lang.level}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{lang.progress}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{lang.masteredCards}</div>
                <div className="text-xs text-gray-500">Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{lang.totalCards}</div>
                <div className="text-xs text-gray-500">Total Cards</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500" 
                style={{width: `${lang.progress}%`}}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <div key={achievement.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
          achievement.earned 
            ? 'border-green-400 bg-gradient-to-r from-green-50 to-white' 
            : 'border-gray-300 opacity-60'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{achievement.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
              </div>
              <p className="text-sm text-gray-600">{achievement.description}</p>
              {achievement.earned && achievement.earnedDate && (
                <p className="text-xs text-green-600 mt-1">
                  Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {achievement.earned && (
              <Check className="w-6 h-6 text-green-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const NFTsTab = () => (
    <div className="space-y-4">
      {nftCertificates.map((nft) => (
        <div key={nft.id} className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-2xl">
              {nft.image}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{nft.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{nft.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Minted: {new Date(nft.mintDate).toLocaleDateString()}</span>
                <span>Token: {nft.tokenId}</span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* Wallet Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Wallet Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Wallet Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono">
                {userProfile.walletAddress}
              </code>
              <button
                onClick={copyAddress}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Network</label>
            <div className="text-sm text-gray-800 mt-1">Flow Mainnet</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Daily study reminders</span>
            <button className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Achievement notifications</span>
            <button className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Weekly progress reports</span>
            <button className="w-10 h-6 bg-gray-300 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Account</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-700">Export learning data</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-700">Reset progress</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-red-600">
            <span className="text-sm">Delete account</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'progress': return <ProgressTab />;
      case 'achievements': return <AchievementsTab />;
      case 'nfts': return <NFTsTab />;
      case 'settings': return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">{userProfile.displayName}</h1>
              <p className="text-sm text-gray-600">
                Learning since {new Date(userProfile.joinDate).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  {userStats.currentStreak} day streak
                </span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'progress', label: 'Progress', icon: TrendingUp },
              { key: 'achievements', label: 'Achievements', icon: Trophy },
              { key: 'nfts', label: 'NFTs', icon: Award },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 text-xs font-medium transition-colors min-w-[60px] ${
                  activeTab === key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}