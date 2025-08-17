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
  
  // Get all decks (simplified)
  GET_ALL_DECKS: `
import LeitnerLang from 0x17c88b3a4fab12ef

access(all) fun main(): [{String: AnyStruct}] {
    var allDecks: [{String: AnyStruct}] = []
    
    // Get next deck ID to know how many decks exist
    let maxDeckId = LeitnerLang.nextDeckId
    
    var deckId: UInt64 = 1
    while deckId < maxDeckId {
        if let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId) {
            allDecks.append(deckInfo)
        }
        deckId = deckId + 1
    }
    
    return allDecks
}
  `,
  
  // Get cards due for review from get_cards_for_review.cdc
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
  `
};

// Helper functions
export const flowService = {
  // Execute a script (read-only)
  async executeScript(script: string, args: any[] = []) {
    try {
      return await fcl.query({
        cadence: script,
        args: (arg: any, t: any) => args.map(a => arg(a, t.String)) // Adjust types as needed
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
        args: (arg: any, t: any) => args.map(a => arg(a, t.String)), // Adjust types as needed
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