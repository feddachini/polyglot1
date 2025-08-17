'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Home, User, BookOpen, LogOut, Wallet, GraduationCap } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext();

  const isAuthenticated = !!primaryWallet;

  const navItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/',
      requiresAuth: true,
    },
    {
      label: 'Learn',
      icon: GraduationCap,
      path: '/learn',
      requiresAuth: true,
    },
    {
      label: 'Profile',
      icon: User,
      path: '/profile',
      requiresAuth: true,
    },

  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleConnect = () => {
    setShowAuthFlow(true);
  };

  const handleDisconnect = () => {
    handleLogOut();
    router.push('/onboarding');
  };

  // Don't show navigation on onboarding page unless authenticated
  if (pathname === '/onboarding' && !isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">LeitnerLang</span>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const canAccess = !item.requiresAuth || isAuthenticated;
              
              if (!canAccess) return null;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Wallet Info */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono text-gray-800">
                    {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                  </span>
                </div>
                
                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const canAccess = !item.requiresAuth || isAuthenticated;
              
              if (!canAccess) return null;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 