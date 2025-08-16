import "LeitnerLang"

transaction() {
    
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
    }
    
    execute {
        log("Manually completing Leitner day for user: ".concat(self.signerAddress.toString()))
        
        // Get profile reference for status checking
        let profileRef = self.accountRef.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath())!
        
        // Get current day state before completion
        let currentDayCards = profileRef.getCurrentDayCards()
        let isAlreadyComplete = profileRef.isLeitnerDayComplete()
        
        log("Current day cards remaining: ".concat(currentDayCards.length.toString()))
        log("Day already complete: ".concat(isAlreadyComplete ? "true" : "false"))
        
        if isAlreadyComplete {
            log("ℹ️  Leitner day is already complete. Queue will rotate anyway.")
        } else if currentDayCards.length > 0 {
            log("⚠️  Warning: ".concat(currentDayCards.length.toString()).concat(" cards remain unreviewed."))
            log("💡 These cards will be moved to tomorrow's queue.")
            
            // Log which cards are being moved
            for cardId in currentDayCards {
                log("Moving unreviewed card ".concat(cardId.toString()).concat(" to tomorrow"))
            }
        }
        
        // Force complete the Leitner day using contract function
        LeitnerLang.forceCompleteLeitnerDay(account: self.accountRef)
        
        // Get updated state after completion
        let newCurrentDayCards = profileRef.getCurrentDayCards()
        let stats = profileRef.getStats()
        let streakDays = stats["streakDays"] as! UInt32? ?? 0
        
        log("=== LEITNER DAY COMPLETION SUMMARY ===")
        log("Queue rotated successfully")
        log("New current day cards: ".concat(newCurrentDayCards.length.toString()))
        log("Current streak: ".concat(streakDays.toString()).concat(" days"))
        
        if newCurrentDayCards.length > 0 {
            log("🎯 Ready for next day! ".concat(newCurrentDayCards.length.toString()).concat(" cards due for review."))
            
            // Log details of cards due for the new day
            var cardIds: String = "["
            var i = 0
            for cardId in newCurrentDayCards {
                if i > 0 {
                    cardIds = cardIds.concat(", ")
                }
                cardIds = cardIds.concat(cardId.toString())
                i = i + 1
            }
            cardIds = cardIds.concat("]")
            log("Cards due today: ".concat(cardIds))
        } else {
            log("📚 No cards scheduled for today. Add more cards or wait for future reviews.")
        }
        
        log("🎉 Leitner day completed successfully!")
        log("Use get_leitner_queue script to see the updated queue state.")
    }
} 