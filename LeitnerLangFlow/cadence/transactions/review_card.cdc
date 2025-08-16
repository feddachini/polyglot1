import "LeitnerLang"

transaction(cardId: UInt64, correct: Bool) {
    
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
        
        // Validate card ID
        if cardId == 0 {
            panic("Invalid card ID")
        }
    }
    
    execute {
        // Get the current card level before review
        let currentLevel = LeitnerLang.getCardLevel(userAddress: self.signerAddress, cardId: cardId)
        
        log("Reviewing card ID: ".concat(cardId.toString()))
        log("Current level: ".concat((currentLevel ?? 0).toString()))
        
        let correctString = correct ? "true" : "false"
        log("Answer correct: ".concat(correctString))
        
        // Get current day cards count before review
        let cardsDueBefore = LeitnerLang.getCardsDueForReview(userAddress: self.signerAddress)
        log("Cards due before review: ".concat(cardsDueBefore.length.toString()))
        
        // Review the card using the contract function (uses queue logic)
        LeitnerLang.reviewCard(
            account: self.accountRef,
            cardId: cardId,
            correct: correct
        )
        
        // Get the new level after review
        let newLevel = LeitnerLang.getCardLevel(userAddress: self.signerAddress, cardId: cardId)
        let cardsDueAfter = LeitnerLang.getCardsDueForReview(userAddress: self.signerAddress)
        
        log("New level: ".concat((newLevel ?? 0).toString()))
        log("Cards due after review: ".concat(cardsDueAfter.length.toString()))
        
        // Log level progression
        if correct {
            if let current = currentLevel {
                if let new = newLevel {
                    if new > current {
                        log("Level increased from ".concat(current.toString()).concat(" to ").concat(new.toString()))
                        
                        // Calculate next interval for queue system
                        if new <= 6 {
                            let intervals = [1, 2, 4, 8, 16, 32]
                            let nextInterval = intervals[new - 1]
                            log("Card will appear again in ".concat(nextInterval.toString()).concat(" Leitner days"))
                        } else if new == 0 {
                            log("Card has been archived (learned)!")
                        }
                    } else if new == 0 {
                        log("Card reached level 7 and is now archived (learned)!")
                    }
                }
            }
        } else {
            log("Card level reset to 1 due to incorrect answer")
            log("Card will appear again in 1 Leitner day")
        }
        
        // Check if all cards are done (but don't auto-complete)
        if cardsDueAfter.length == 0 {
            log("✅ All cards reviewed! Use complete_leitner_day transaction to advance to next day.")
        } else {
            log("📚 ".concat(cardsDueAfter.length.toString()).concat(" cards remaining today."))
        }
        
        log("Card review completed successfully")
    }
}
