import * as fcl from "@onflow/fcl";

// Configure FCL for Flow testnet
fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0x17c88b3a4fab12ef.LeitnerLang": "0x17c88b3a4fab12ef" // Your deployed contract
});

// Contract address
export const LEITNER_LANG_CONTRACT = "0x17c88b3a4fab12ef";

// Use your actual script files from /cadence/scripts/
export const SCRIPTS = {
  // Get user profile from get_profile.cdc
  GET_PROFILE: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    if userAddress.toString().length == 0 {
        return nil
    }
    
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return nil
    }
    
    if let profileRef = profileCap.borrow() {
        let stats = profileRef.getStats()
        
        var profileData: {String: AnyStruct} = {}
        
        profileData["totalCards"] = stats["totalCards"]
        profileData["totalReviews"] = stats["totalReviews"]
        profileData["streakDays"] = stats["streakDays"]
        profileData["primaryLanguage"] = stats["primaryLanguage"]
        profileData["createdAt"] = stats["createdAt"]
        profileData["userAddress"] = userAddress.toString()
        
        let cardsDue = LeitnerLang.getCardsDueForReview(userAddress: userAddress)
        profileData["cardsDueForReview"] = cardsDue.length
        profileData["cardsDueIds"] = cardsDue
        
        profileData["hasActiveProfile"] = true
        profileData["profileStatus"] = (stats["totalCards"] as! Int? ?? 0) > 0 ? "Active" : "Setup Complete"
        
        return profileData
    }
    
    return nil
}
  `,
  
  // Get deck info from get_deck_info.cdc
  GET_DECK: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(deckId: UInt64): {String: AnyStruct}? {
    if deckId == 0 {
        return nil
    }
    
    let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
    
    if deckInfo == nil {
        return nil
    }
    
    var enhancedInfo: {String: AnyStruct} = {}
    
    enhancedInfo["id"] = deckInfo!["id"]
    enhancedInfo["concept"] = deckInfo!["concept"]
    enhancedInfo["meaning"] = deckInfo!["meaning"]
    enhancedInfo["createdAt"] = deckInfo!["createdAt"]
    enhancedInfo["creator"] = deckInfo!["creator"]
    
    return enhancedInfo
}
  `,
  
  // Get all decks with enhanced information
  GET_ALL_DECKS: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(): [{String: AnyStruct}] {
    var deckSummaries: [{String: AnyStruct}] = []
    
    // Get the current max deck ID (nextDeckId - 1)
    let maxDeckId = LeitnerLang.nextDeckId - 1
    
    // Iterate through all possible deck IDs starting from 1
    var deckId: UInt64 = 1
    while deckId <= maxDeckId {
        // Try to get deck information
        if let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId) {
            var summary: {String: AnyStruct} = {}
            
            summary["id"] = deckId
            summary["concept"] = deckInfo["concept"]
            summary["meaning"] = deckInfo["meaning"]
            summary["creator"] = deckInfo["creator"]
            summary["createdAt"] = deckInfo["createdAt"]
            
            // Calculate age
            let createdAt = deckInfo["createdAt"] as! UFix64? ?? 0.0
            let currentTime = getCurrentBlock().timestamp
            let daysSinceCreation = (currentTime - createdAt) / 86400.0
            summary["daysSinceCreation"] = daysSinceCreation
            
            // Add concept display
            let concept = deckInfo["concept"] as! String? ?? ""
            let meaning = deckInfo["meaning"] as! String? ?? ""
            summary["displayText"] = concept.concat(": ").concat(meaning)
            
            deckSummaries.append(summary)
        }
        
        deckId = deckId + 1
    }
    
    return deckSummaries
}
  `,
  
  // Get cards due for review with full details
  GET_CARDS_DUE: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(userAddress: Address): [{String: AnyStruct}] {
    if userAddress.toString().length == 0 {
        return []
    }
    
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return []
    }
    
    if let profileRef = profileCap.borrow() {
        let cardsDueIds = profileRef.getCardsDueForReview()
        
        if cardsDueIds.length == 0 {
            return []
        }
        
        var cardsDueInfo: [{String: AnyStruct}] = []
        
        for cardId in cardsDueIds {
            var cardInfo: {String: AnyStruct} = {}
            
            cardInfo["cardId"] = cardId
            cardInfo["userAddress"] = userAddress.toString()
            
            if let level = profileRef.getCardLevel(cardId: cardId) {
                cardInfo["currentLevel"] = level
            } else {
                cardInfo["currentLevel"] = 1
            }
            
            // Get full card details from the contract
            if let cardDetails = LeitnerLang.getCardInfo(cardId: cardId) {
                cardInfo["frontText"] = cardDetails["frontText"]
                cardInfo["frontPhonetic"] = cardDetails["frontPhonetic"]
                cardInfo["frontLanguage"] = cardDetails["frontLanguage"]
                cardInfo["backText"] = cardDetails["backText"]
                cardInfo["backPhonetic"] = cardDetails["backPhonetic"]
                cardInfo["backLanguage"] = cardDetails["backLanguage"]
                cardInfo["deckId"] = cardDetails["deckId"]
                
                let frontText = cardDetails["frontText"] as! String? ?? ""
                let backText = cardDetails["backText"] as! String? ?? ""
                let frontLanguage = cardDetails["frontLanguage"] as! String? ?? ""
                let backLanguage = cardDetails["backLanguage"] as! String? ?? ""
                
                cardInfo["displayText"] = frontText.concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")")
                cardInfo["languagePair"] = frontLanguage.concat(" → ").concat(backLanguage)
            }
            
            cardsDueInfo.append(cardInfo)
        }
        
        return cardsDueInfo
    }
    
    return []
}
  `,

  // Check if profile exists
  CHECK_PROFILE_EXISTS: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(userAddress: Address): Bool {
    if userAddress.toString().length == 0 {
        return false
    }
    
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    return profileCap.check()
}
  `,
  
  // Get cards by deck ID
  GET_CARDS_BY_DECK: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(deckId: UInt64): [{String: AnyStruct}] {
    var deckCards: [{String: AnyStruct}] = []
    
    let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
    if deckInfo == nil {
        return []
    }
    
    let maxCardId = LeitnerLang.nextCardId - 1
    
    var cardId: UInt64 = 1
    while cardId <= maxCardId {
        if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
            let cardDeckId = cardInfo["deckId"] as! UInt64? ?? 0
            
            if cardDeckId == deckId {
                var cardData: {String: AnyStruct} = {}
                
                cardData["id"] = cardId
                cardData["frontText"] = cardInfo["frontText"]
                cardData["frontPhonetic"] = cardInfo["frontPhonetic"]
                cardData["frontLanguage"] = cardInfo["frontLanguage"]
                cardData["backText"] = cardInfo["backText"]
                cardData["backPhonetic"] = cardInfo["backPhonetic"]
                cardData["backLanguage"] = cardInfo["backLanguage"]
                cardData["deckId"] = cardInfo["deckId"]
                cardData["createdAt"] = cardInfo["createdAt"]
                
                let frontText = cardInfo["frontText"] as! String? ?? ""
                let backText = cardInfo["backText"] as! String? ?? ""
                let frontLanguage = cardInfo["frontLanguage"] as! String? ?? ""
                let backLanguage = cardInfo["backLanguage"] as! String? ?? ""
                
                cardData["displayText"] = frontText.concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")")
                cardData["languagePair"] = frontLanguage.concat(" → ").concat(backLanguage)
                cardData["isReversible"] = frontLanguage != backLanguage
                
                deckCards.append(cardData)
            }
        }
        
        cardId = cardId + 1
    }
    
    return deckCards
}
  `,

  // Get Leitner queue information
  GET_LEITNER_QUEUE: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    if userAddress.toString().length == 0 {
        return nil
    }
    
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return nil
    }
    
    if let profileRef = profileCap.borrow() {
        var queueInfo: {String: AnyStruct} = {}
        
        queueInfo["userAddress"] = userAddress.toString()
        queueInfo["queryTimestamp"] = getCurrentBlock().timestamp
        
        let currentDayCards = profileRef.getCurrentDayCards()
        queueInfo["currentDayCards"] = currentDayCards
        queueInfo["currentDayCount"] = currentDayCards.length
        queueInfo["isLeitnerDayComplete"] = profileRef.isLeitnerDayComplete()
        
        let stats = profileRef.getStats()
        queueInfo["totalCards"] = stats["totalCards"]
        queueInfo["totalReviews"] = stats["totalReviews"]
        queueInfo["streakDays"] = stats["streakDays"]
        
        if currentDayCards.length == 0 {
            queueInfo["recommendation"] = "🎉 Current day complete! Queue will rotate when you add more cards or complete a review session."
            queueInfo["status"] = "Day Complete"
            queueInfo["nextAction"] = "Add more cards to your Leitner system or wait for future scheduled cards"
        } else if currentDayCards.length <= 5 {
            queueInfo["recommendation"] = "📚 Light study day - perfect for focused learning!"
            queueInfo["status"] = "Light Load"
            queueInfo["nextAction"] = "Review ".concat(currentDayCards.length.toString()).concat(" cards using review_card transaction")
        } else if currentDayCards.length <= 15 {
            queueInfo["recommendation"] = "📖 Normal study session - good learning pace."
            queueInfo["status"] = "Normal Load"
            queueInfo["nextAction"] = "Review ".concat(currentDayCards.length.toString()).concat(" cards using review_card transaction")
        } else {
            queueInfo["recommendation"] = "📚 Heavy study day - consider breaking into multiple sessions."
            queueInfo["status"] = "Heavy Load"
            queueInfo["nextAction"] = "Review ".concat(currentDayCards.length.toString()).concat(" cards using review_card transaction")
        }
        
        return queueInfo
    }
    
    return nil
}
  `
};

// Use your actual transaction files from /cadence/transactions/
export const TRANSACTIONS = {
  // Setup profile transaction
  SETUP_PROFILE: `
import LeitnerLang from 0x17c88b3a4fab12ef

transaction(primaryLanguage: String) {
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if profile already exists
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) != nil {
            panic("Profile already exists for this account")
        }
        
        // Validate primary language input
        if primaryLanguage.length == 0 {
            panic("Primary language cannot be empty")
        }
        
        // Setup the profile using the contract function
        LeitnerLang.setupProfile(account: signer, primaryLanguage: primaryLanguage)
    }
    
    execute {
        log("Profile setup completed successfully for primary language: ".concat(primaryLanguage))
    }
}
  `,
  
  // Create deck transaction
  CREATE_DECK: `
import LeitnerLang from 0x17c88b3a4fab12ef

transaction(concept: String, meaning: String) {
    
    let adminRef: &LeitnerLang.Admin
    
    prepare(signer: auth(Storage) &Account) {
        // Get admin capability from signer's account
        self.adminRef = signer.storage.borrow<&LeitnerLang.Admin>(from: /storage/LeitnerLangAdmin)
            ?? panic("Signer does not have admin access")
        
        // Validate input parameters
        if concept.length == 0 {
            panic("Deck concept cannot be empty")
        }
        
        if meaning.length == 0 {
            panic("Deck meaning cannot be empty")
        }
    }
    
    execute {
        // Create the deck using admin reference
        let deckId = LeitnerLang.createDeck(
            concept: concept,
            meaning: meaning,
            adminRef: self.adminRef
        )
        
        log("Deck created successfully with ID: ".concat(deckId.toString()))
        log("Concept: ".concat(concept))
        log("Meaning: ".concat(meaning))
    }
}
  `,
  
  // Create card transaction
  CREATE_CARD: `
import LeitnerLang from 0x17c88b3a4fab12ef

transaction(
    frontText: String,
    frontPhonetic: String?,
    frontLanguage: String,
    backText: String,
    backPhonetic: String?,
    backLanguage: String,
    deckId: UInt64
) {
    
    let adminRef: &LeitnerLang.Admin
    
    prepare(signer: auth(Storage) &Account) {
        // Get admin capability from signer's account
        self.adminRef = signer.storage.borrow<&LeitnerLang.Admin>(from: /storage/LeitnerLangAdmin)
            ?? panic("Signer does not have admin access")
        
        // Validate input parameters
        if frontText.length == 0 {
            panic("Front text cannot be empty")
        }
        
        if backText.length == 0 {
            panic("Back text cannot be empty")
        }
        
        if frontLanguage.length == 0 {
            panic("Front language cannot be empty")
        }
        
        if backLanguage.length == 0 {
            panic("Back language cannot be empty")
        }
        
        // Verify deck exists
        let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
        if deckInfo == nil {
            panic("Deck with ID ".concat(deckId.toString()).concat(" does not exist"))
        }
    }
    
    execute {
        // Create the card using admin reference
        let cardId = LeitnerLang.createCard(
            frontText: frontText,
            frontPhonetic: frontPhonetic,
            frontLanguage: frontLanguage,
            backText: backText,
            backPhonetic: backPhonetic,
            backLanguage: backLanguage,
            deckId: deckId,
            adminRef: self.adminRef
        )
        
        log("Card created successfully with ID: ".concat(cardId.toString()))
        log("Front: ".concat(frontText).concat(" (").concat(frontLanguage).concat(")"))
        log("Back: ".concat(backText).concat(" (").concat(backLanguage).concat(")"))
        log("Added to deck ID: ".concat(deckId.toString()))
    }
}
  `,
  
  // Add cards to Leitner system transaction
  ADD_LEITNER_CARDS: `
import LeitnerLang from 0x17c88b3a4fab12ef

transaction(deckId: UInt64, languages: [String]) {
    
    let signerAddress: Address
    let accountRef: auth(Storage) &Account
    
    prepare(signer: auth(Storage) &Account) {
        // Store signer address and account reference for use in execute block
        self.signerAddress = signer.address
        self.accountRef = signer
        
        // Validate that user has a profile
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) == nil {
            panic("User profile not found. Please set up your profile first.")
        }
        
        // Validate deck ID
        if deckId == 0 {
            panic("Invalid deck ID")
        }
        
        // Validate languages array
        if languages.length == 0 {
            panic("Languages array cannot be empty")
        }
        
        if languages.length > 10 {
            panic("Too many languages selected (maximum 10)")
        }
        
        // Validate each language is not empty
        for language in languages {
            if language.length == 0 {
                panic("Language cannot be empty string")
            }
        }
        
        // Verify deck exists
        let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
        if deckInfo == nil {
            panic("Deck with ID ".concat(deckId.toString()).concat(" does not exist"))
        }
    }
    
    execute {
        log("Adding Leitner cards from deck ID: ".concat(deckId.toString()))
        
        // Format languages array for logging
        var languagesString = "["
        var i = 0
        for language in languages {
            if i > 0 {
                languagesString = languagesString.concat(", ")
            }
            languagesString = languagesString.concat(language)
            i = i + 1
        }
        languagesString = languagesString.concat("]")
        log("Selected languages: ".concat(languagesString))
        
        // Get profile reference
        let profileRef = self.accountRef.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath())!
        
        var cardsAdded = 0
        var cardsSkipped = 0
        var languagePairsProcessed: [String] = []
        
        // We need to iterate through all possible cards to find matching language pairs
        // Since we don't have a direct way to query cards by deck and language,
        // we'll iterate through card IDs starting from 1
        var cardId: UInt64 = 1
        let maxCardId: UInt64 = LeitnerLang.nextCardId - 1 // Current max card ID
        
        while cardId <= maxCardId {
            // Get card info
            if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
                let cardDeckId = cardInfo["deckId"] as! UInt64? ?? 0
                
                // Check if this card belongs to the specified deck
                if cardDeckId == deckId {
                    let frontLanguage = cardInfo["frontLanguage"] as! String? ?? ""
                    let backLanguage = cardInfo["backLanguage"] as! String? ?? ""
                    
                    // Check if both front and back languages are in our selected languages
                    if languages.contains(frontLanguage) && languages.contains(backLanguage) && frontLanguage != backLanguage {
                        // Check if user already has this card in their Leitner system
                        if profileRef.getCardLevel(cardId: cardId) == nil {
                            // Add card to Leitner system
                            profileRef.addCardToLeitner(cardId: cardId)
                            cardsAdded = cardsAdded + 1
                            
                            let languagePair = frontLanguage.concat(" → ").concat(backLanguage)
                            if !languagePairsProcessed.contains(languagePair) {
                                languagePairsProcessed.append(languagePair)
                            }
                            
                            let frontText = cardInfo["frontText"] as! String? ?? ""
                            let backText = cardInfo["backText"] as! String? ?? ""
                            log("Added card: ".concat(frontText).concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")"))
                        } else {
                            cardsSkipped = cardsSkipped + 1
                            log("Skipped card ID ".concat(cardId.toString()).concat(" - already in Leitner system"))
                        }
                    }
                }
            }
            cardId = cardId + 1
        }
        
        // Log summary
        log("=== ADD LEITNER CARDS SUMMARY ===")
        log("Deck ID: ".concat(deckId.toString()))
        log("Languages selected: ".concat(languages.length.toString()))
        log("Cards added to Leitner system: ".concat(cardsAdded.toString()))
        log("Cards skipped (already in system): ".concat(cardsSkipped.toString()))
        
        if cardsAdded > 0 {
            let currentDayCards = profileRef.getCurrentDayCards()
            log("Cards now due for review today: ".concat(currentDayCards.length.toString()))
            log("🎯 Ready to start learning! Use review_card transaction to begin studying.")
        } else if cardsSkipped > 0 {
            log("ℹ️  All matching cards are already in your Leitner system.")
        } else {
            log("⚠️  No cards found matching the selected languages in this deck.")
            log("💡 Make sure cards exist for the language pairs you selected.")
        }
        
        log("Transaction completed successfully")
    }
}
  `,
  
  // Review card transaction
  REVIEW_CARD: `
import LeitnerLang from 0x17c88b3a4fab12ef

transaction(cardId: UInt64, correct: Bool) {
    
    let signerAddress: Address
    let accountRef: auth(Storage) &Account
    
    prepare(signer: auth(Storage) &Account) {
        self.signerAddress = signer.address
        self.accountRef = signer
        
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) == nil {
            panic("User profile not found. Please set up your profile first.")
        }
        
        if cardId == 0 {
            panic("Invalid card ID")
        }
    }
    
    execute {
        let currentLevel = LeitnerLang.getCardLevel(userAddress: self.signerAddress, cardId: cardId)
        
        log("Reviewing card ID: ".concat(cardId.toString()))
        log("Current level: ".concat((currentLevel ?? 0).toString()))
        log("Answer correct: ".concat(correct ? "true" : "false"))
        
        let cardsDueBefore = LeitnerLang.getCardsDueForReview(userAddress: self.signerAddress)
        log("Cards due before review: ".concat(cardsDueBefore.length.toString()))
        
        LeitnerLang.reviewCard(
            account: self.accountRef,
            cardId: cardId,
            correct: correct
        )
        
        let newLevel = LeitnerLang.getCardLevel(userAddress: self.signerAddress, cardId: cardId)
        let cardsDueAfter = LeitnerLang.getCardsDueForReview(userAddress: self.signerAddress)
        
        log("New level: ".concat((newLevel ?? 0).toString()))
        log("Cards due after review: ".concat(cardsDueAfter.length.toString()))
        
        if cardsDueAfter.length == 0 {
            log("✅ All cards reviewed! Use complete_leitner_day transaction to advance to next day.")
        } else {
            log("📚 ".concat(cardsDueAfter.length.toString()).concat(" cards remaining today."))
        }
        
        log("Card review completed successfully")
    }
}
  `,
  
  // Complete Leitner day transaction
  COMPLETE_LEITNER_DAY: `
import LeitnerLang from 0x17c88b3a4fab12ef

transaction() {
    
    let signerAddress: Address
    let accountRef: auth(Storage) &Account
    
    prepare(signer: auth(Storage) &Account) {
        self.signerAddress = signer.address
        self.accountRef = signer
        
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) == nil {
            panic("User profile not found. Please set up your profile first.")
        }
    }
    
    execute {
        log("Manually completing Leitner day for user: ".concat(self.signerAddress.toString()))
        
        let profileRef = self.accountRef.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath())!
        
        let currentDayCards = profileRef.getCurrentDayCards()
        let isAlreadyComplete = profileRef.isLeitnerDayComplete()
        
        log("Current day cards remaining: ".concat(currentDayCards.length.toString()))
        log("Day already complete: ".concat(isAlreadyComplete ? "true" : "false"))
        
        if isAlreadyComplete {
            log("ℹ️  Leitner day is already complete. Queue will rotate anyway.")
        } else if currentDayCards.length > 0 {
            log("⚠️  Warning: ".concat(currentDayCards.length.toString()).concat(" cards remain unreviewed."))
            log("💡 These cards will be moved to tomorrow's queue.")
            
            for cardId in currentDayCards {
                log("Moving unreviewed card ".concat(cardId.toString()).concat(" to tomorrow"))
            }
        }
        
        LeitnerLang.forceCompleteLeitnerDay(account: self.accountRef)
        
        let newCurrentDayCards = profileRef.getCurrentDayCards()
        let stats = profileRef.getStats()
        let streakDays = stats["streakDays"] as! UInt32? ?? 0
        
        log("=== LEITNER DAY COMPLETION SUMMARY ===")
        log("Queue rotated successfully")
        log("New current day cards: ".concat(newCurrentDayCards.length.toString()))
        log("Current streak: ".concat(streakDays.toString()).concat(" days"))
        
        if newCurrentDayCards.length > 0 {
            log("🎯 Ready for next day! ".concat(newCurrentDayCards.length.toString()).concat(" cards due for review."))
        } else {
            log("📚 No cards scheduled for today. Add more cards or wait for future reviews.")
        }
        
        log("🎉 Leitner day completed successfully!")
    }
}
  `
};

// Helper functions
// Helper function to normalize Flow addresses
function normalizeFlowAddress(address: string): string {
  if (!address) return address;
  
  // Remove any whitespace
  const cleaned = address.trim();
  console.log('Normalizing address:', cleaned, 'length:', cleaned.length);
  
  // If it already has 0x and is 18 chars, return as-is
  if (cleaned.startsWith('0x') && cleaned.length === 18) {
    return cleaned;
  }
  
  // If it's 16 hex chars without 0x, add 0x
  if (!cleaned.startsWith('0x') && cleaned.length === 16 && /^[a-fA-F0-9]{16}$/.test(cleaned)) {
    return `0x${cleaned}`;
  }
  
  // If it's longer, check if it's an EVM address and needs special handling
  if (cleaned.length === 42 && cleaned.startsWith('0x')) {
    // This is likely an EVM address, but we need to check if this is actually Flow-derived
    // For now, let's try to map it or use it as-is and let the user/system handle the mismatch
    console.warn('EVM address detected - this may not correspond to Flow address:', cleaned);
    
    // Try to extract last 16 hex chars as fallback
    const hexMatch = cleaned.match(/([a-fA-F0-9]{16})$/);
    if (hexMatch) {
      const flowAddress = `0x${hexMatch[1]}`;
      console.log('Extracted Flow address from EVM address:', flowAddress);
      return flowAddress;
    }
  }
  
  // If nothing works, return as-is and let FCL handle the error
  console.warn('Could not normalize address:', cleaned);
  return cleaned;
}

export const flowService = {
  // Expose the address normalization function
  normalizeAddress: normalizeFlowAddress,
  
  // Get the actual FCL user address (the one signing transactions)
  async getCurrentUserAddress(): Promise<string | null> {
    try {
      const user = await fcl.currentUser.snapshot();
      if (user?.addr) {
        console.log('FCL current user address:', user.addr);
        return user.addr;
      }
      return null;
    } catch (error) {
      console.error('Failed to get FCL user address:', error);
      return null;
    }
  },
  
  // Execute a script (read-only)
  async executeScript(script: string, args: any[] = []) {
    try {
      console.log('Executing script with args:', args);
      return await fcl.query({
        cadence: script,
        args: (arg: any, t: any) => args.map((a, index) => {
          console.log(`Processing arg[${index}]:`, a, 'type:', typeof a, 'length:', a?.length);
          
          // Handle different argument types
          if (typeof a === 'string') {
            const cleaned = a.trim();
            
            // Check if string is a number (like deck ID)
            if (/^\d+$/.test(cleaned)) {
              const num = parseInt(cleaned);
              console.log('Treating numeric string as UInt64:', num);
              return arg(num, t.UInt64);
            }
            
            // Check if this might be an address by checking for hex patterns
            const isLikelyAddress = /[a-fA-F0-9]{16,}/.test(cleaned) && cleaned.length >= 16;
            
            if (isLikelyAddress) {
              const address = normalizeFlowAddress(cleaned);
              console.log('Treating as Flow address:', address);
              return arg(address, t.Address);
            } else {
              // Regular string parameter
              console.log('Treating as string:', cleaned);
              return arg(cleaned, t.String);
            }
          } else if (typeof a === 'number') {
            console.log('Treating as UInt64:', a);
            return arg(a, t.UInt64);
          } else if (typeof a === 'boolean') {
            console.log('Treating as Bool:', a);
            return arg(a, t.Bool);
          } else {
            console.log('Treating as string fallback:', a);
            return arg(String(a), t.String);
          }
        })
      });
    } catch (error) {
      console.error("Script execution failed:", error);
      throw error;
    }
  },

  // Send a transaction (write operation)
  async sendTransaction(transaction: string, args: any[] = []) {
    try {
      const txId = await fcl.mutate({
        cadence: transaction,
        args: (arg: any, t: any) => args.map((a, index) => {
          console.log(`Processing transaction arg[${index}]:`, a, 'type:', typeof a, 'length:', a?.length);
          
          // Handle different argument types
          if (a === null || a === undefined) {
            console.log('Treating as optional null:', a);
            return arg(null, t.Optional(t.String));
          } else if (typeof a === 'string') {
            // Check if this might be an address by checking for hex patterns
            const cleaned = a.trim();
            const isLikelyAddress = /[a-fA-F0-9]{16,}/.test(cleaned) && cleaned.length >= 16;
            
            // Check if it's a numeric string that should be UInt64
            if (/^\d+$/.test(cleaned)) {
              console.log('Treating transaction arg as UInt64 from string:', cleaned);
              return arg(parseInt(cleaned), t.UInt64);
            } else if (isLikelyAddress) {
              const address = normalizeFlowAddress(cleaned);
              console.log('Treating transaction arg as Flow address:', address);
              return arg(address, t.Address);
            } else {
              // Regular string parameter
              console.log('Treating transaction arg as string:', cleaned);
              return arg(cleaned, t.String);
            }
          } else if (typeof a === 'number') {
            console.log('Treating transaction arg as UInt64:', a);
            return arg(a, t.UInt64);
          } else if (typeof a === 'boolean') {
            console.log('Treating transaction arg as Bool:', a);
            return arg(a, t.Bool);
          } else if (Array.isArray(a)) {
            console.log('Treating transaction arg as string array:', a);
            return arg(a, t.Array(t.String));
          } else {
            console.log('Treating transaction arg as string fallback:', a);
            return arg(String(a), t.String);
          }
        }),
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });
      
      return await fcl.tx(txId).onceSealed();
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    return await fcl.currentUser.snapshot();
  },

  // Authenticate user
  async authenticate() {
    return await fcl.authenticate();
  },

  // Unauthenticate user
  async unauthenticate() {
    return await fcl.unauthenticate();
  }
}; 