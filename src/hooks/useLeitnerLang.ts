import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { flowService, SCRIPTS, TRANSACTIONS } from '../lib/flow';

// Mock types for now - replace with actual types when FCL is installed
interface Deck {
  id: string;
  concept: string;
  creator: string;
  cardCount: number;
}

interface Profile {
  primaryLanguage: string;
  owner: string;
  createdAt: string;
}

export const useLeitnerLang = () => {
  const { user, primaryWallet } = useDynamicContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with actual contract calls
  const [decks, setDecks] = useState<Deck[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Get testnet FLOW from faucet
  const fundAccount = async () => {
    if (!primaryWallet?.address) return;
    
    // For COA address, you'd need to convert Flow address to EVM address
    // For now, direct users to the faucet
    const faucetUrl = 'https://faucet.flow.com/fund-account';
    window.open(faucetUrl, '_blank');
  };

  // Setup user profile
  const setupProfile = async (primaryLanguage: string) => {
    if (!primaryWallet) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Setting up profile with language:', primaryLanguage);
      
      // First check if profile already exists
      const existingProfile = await flowService.executeScript(
        SCRIPTS.GET_PROFILE,
        [primaryWallet.address]
      );
      
      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        // Convert contract profile to local format
        const profile: Profile = {
          primaryLanguage: existingProfile.primaryLanguage || primaryLanguage,
          owner: primaryWallet.address,
          createdAt: existingProfile.createdAt ? new Date(existingProfile.createdAt * 1000).toISOString() : new Date().toISOString()
        };
        setProfile(profile);
        return; // Don't try to create a new one
      }
      
      // Profile doesn't exist, create it
      const result = await flowService.sendTransaction(
        TRANSACTIONS.SETUP_PROFILE,
        [primaryLanguage]
      );
      
      console.log('Profile setup transaction result:', result);
      
      // Create local profile object
      const newProfile: Profile = {
        primaryLanguage,
        owner: primaryWallet.address,
        createdAt: new Date().toISOString()
      };
      setProfile(newProfile);
      
    } catch (err) {
      console.error('Profile setup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to setup profile';
      
      // If the error is about profile already existing, try to load the existing profile
      if (errorMessage.includes('Profile already exists')) {
        try {
          const existingProfile = await flowService.executeScript(
            SCRIPTS.GET_PROFILE,
            [primaryWallet.address]
          );
          
          if (existingProfile) {
            const profile: Profile = {
              primaryLanguage: existingProfile.primaryLanguage || primaryLanguage,
              owner: primaryWallet.address,
              createdAt: existingProfile.createdAt ? new Date(existingProfile.createdAt * 1000).toISOString() : new Date().toISOString()
            };
            setProfile(profile);
            return;
          }
        } catch (loadError) {
          console.error('Failed to load existing profile:', loadError);
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new deck
  const createDeck = async (concept: string) => {
    if (!primaryWallet) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating deck:', concept);
      
      // Real FCL transaction call - your contract needs both concept AND meaning
      const meaning = `${concept} vocabulary and phrases`; // Auto-generate meaning
      const result = await flowService.sendTransaction(
        TRANSACTIONS.CREATE_DECK,
        [concept, meaning]
      );
      
      console.log('Deck creation transaction result:', result);
      
      // Refresh decks from contract
      await loadUserData();
      
    } catch (err) {
      console.error('Deck creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create deck');
    } finally {
      setLoading(false);
    }
  };

  // Create a new card
  const createCard = async (deckId: string, front: string, back: string) => {
    if (!primaryWallet) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating card for deck:', deckId, 'Front:', front, 'Back:', back);
      
      // Real FCL transaction call - your contract needs full card parameters
      const result = await flowService.sendTransaction(
        TRANSACTIONS.CREATE_CARD,
        [
          front,           // frontText
          null,           // frontPhonetic
          'English',      // frontLanguage (default)
          back,           // backText  
          null,           // backPhonetic
          'Spanish',      // backLanguage (default - you could make this configurable)
          parseInt(deckId) // deckId
        ]
      );
      
      console.log('Card creation transaction result:', result);
      
      // Refresh decks from contract
      await loadUserData();
      
    } catch (err) {
      console.error('Card creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  // Load user data
  const loadUserData = async () => {
    if (!primaryWallet?.address) return;
    
    setLoading(true);
    try {
      console.log('Loading user data for:', primaryWallet.address);
      
      // Load all decks from contract
      const allDecks = await flowService.executeScript(SCRIPTS.GET_ALL_DECKS, []);
      console.log('All decks from contract:', allDecks);
      
      // Load user profile
      try {
        const userProfile = await flowService.executeScript(
          SCRIPTS.GET_PROFILE, 
          [primaryWallet.address]
        );
        console.log('User profile from contract:', userProfile);
        
        if (userProfile) {
          setProfile({
            primaryLanguage: userProfile.primaryLanguage || 'English',
            owner: primaryWallet.address,
            createdAt: userProfile.createdAt || new Date().toISOString()
          });
        }
      } catch (profileErr) {
        console.log('No profile found for user:', profileErr);
      }
      
      // Transform contract data to UI format
      if (allDecks && Array.isArray(allDecks)) {
        const transformedDecks = allDecks.map((deck: any, index: number) => ({
          id: (index + 1).toString(),
          concept: deck.concept || `Deck ${index + 1}`,
          creator: deck.creator || primaryWallet.address,
          cardCount: deck.cards?.length || 0
        }));
        setDecks(transformedDecks);
      } else {
        // Fallback to empty array if no decks
        setDecks([]);
      }
      
    } catch (err) {
      console.error('Load user data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      // Fallback to empty state on error
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when wallet connects
  useEffect(() => {
    if (primaryWallet?.address) {
      loadUserData();
    }
  }, [primaryWallet?.address]);

  return {
    // State
    decks,
    profile,
    loading,
    error,
    isConnected: !!primaryWallet,
    userAddress: primaryWallet?.address,
    
    // Actions
    fundAccount,
    setupProfile,
    createDeck,
    createCard,
    loadUserData,
    
    // Contract info
    contractAddress: '0x17c88b3a4fab12ef',
    coaAddress: '0x0000000000000000000000023f07d220dc707f6f', // Your COA EVM address
    network: 'Flow Testnet'
  };
}; 