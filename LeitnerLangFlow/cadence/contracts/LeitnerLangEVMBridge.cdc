import LeitnerLang from 0x17c88b3a4fab12ef

access(all) contract LeitnerLangEVMBridge {
    
    // Events for EVM compatibility
    access(all) event DeckCreatedEVM(id: UInt64, concept: String, creator: String)
    access(all) event CardCreatedEVM(id: UInt64, deckId: UInt64, front: String, back: String)
    access(all) event ProfileSetupEVM(owner: String, primaryLanguage: String)
    
    // Bridge functions that can be called from EVM via COA
    access(all) fun createDeckFromEVM(concept: String, evmAddress: String): UInt64 {
        // Get the calling account (should be a COA)
        let authAccount = self.account
        
        // Call the original Cadence contract
        let deckId = LeitnerLang.createDeck(concept: concept, creator: authAccount.address)
        
        // Emit EVM-compatible event
        emit DeckCreatedEVM(id: deckId, concept: concept, creator: evmAddress)
        
        return deckId
    }
    
    access(all) fun createCardFromEVM(deckId: UInt64, front: String, back: String): UInt64 {
        // Call the original Cadence contract
        let cardId = LeitnerLang.createCard(deckId: deckId, front: front, back: back)
        
        // Emit EVM-compatible event
        emit CardCreatedEVM(id: cardId, deckId: deckId, front: front, back: back)
        
        return cardId
    }
    
    access(all) fun setupProfileFromEVM(primaryLanguage: String, evmAddress: String) {
        let authAccount = self.account
        
        // Setup profile using the original contract
        if authAccount.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.ProfileStoragePath) == nil {
            let profile <- LeitnerLang.createProfile(primaryLanguage: primaryLanguage)
            authAccount.storage.save(<-profile, to: LeitnerLang.ProfileStoragePath)
            
            let profileCap = authAccount.capabilities.storage.issue<&LeitnerLang.Profile>(LeitnerLang.ProfileStoragePath)
            authAccount.capabilities.publish(profileCap, at: LeitnerLang.ProfilePublicPath)
        }
        
        emit ProfileSetupEVM(owner: evmAddress, primaryLanguage: primaryLanguage)
    }
    
    access(all) fun getDeckCount(): UInt64 {
        return LeitnerLang.nextDeckId - 1
    }
    
    access(all) fun getCardCount(): UInt64 {
        return LeitnerLang.nextCardId - 1
    }
} 