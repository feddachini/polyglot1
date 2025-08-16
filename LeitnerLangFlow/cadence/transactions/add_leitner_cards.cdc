import "LeitnerLang"

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
        // Format language pairs array for logging
        var pairsString = "["
        var j = 0
        for pair in languagePairsProcessed {
            if j > 0 {
                pairsString = pairsString.concat(", ")
            }
            pairsString = pairsString.concat(pair)
            j = j + 1
        }
        pairsString = pairsString.concat("]")
        log("Language pairs processed: ".concat(pairsString))
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