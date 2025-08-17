import LeitnerLang from 0x17c88b3a4fab12ef

/// Gets all cards belonging to a specific deck
/// Returns an array of card information for the given deck ID
access(all) fun main(deckId: UInt64): [{String: AnyStruct}] {
    var deckCards: [{String: AnyStruct}] = []
    
    // Validate deck exists
    let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
    if deckInfo == nil {
        return []
    }
    
    // Get the current max card ID
    let maxCardId = LeitnerLang.nextCardId - 1
    
    // Iterate through all possible card IDs and filter by deck
    var cardId: UInt64 = 1
    while cardId <= maxCardId {
        // Try to get card information
        if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
            let cardDeckId = cardInfo["deckId"] as! UInt64? ?? 0
            
            // Check if this card belongs to the specified deck
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
                
                // Add enhanced information
                let frontText = cardInfo["frontText"] as! String? ?? ""
                let backText = cardInfo["backText"] as! String? ?? ""
                let frontLanguage = cardInfo["frontLanguage"] as! String? ?? ""
                let backLanguage = cardInfo["backLanguage"] as! String? ?? ""
                let frontPhonetic = cardInfo["frontPhonetic"] as! String? ?? ""
                let backPhonetic = cardInfo["backPhonetic"] as! String? ?? ""
                
                cardData["displayText"] = frontText.concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")")
                cardData["languagePair"] = frontLanguage.concat(" → ").concat(backLanguage)
                
                // Phonetic display
                if frontPhonetic.length > 0 && backPhonetic.length > 0 {
                    cardData["phoneticDisplay"] = frontPhonetic.concat(" → ").concat(backPhonetic)
                } else if frontPhonetic.length > 0 {
                    cardData["phoneticDisplay"] = frontPhonetic.concat(" → (no phonetic)")
                } else if backPhonetic.length > 0 {
                    cardData["phoneticDisplay"] = "(no phonetic) → ".concat(backPhonetic)
                } else {
                    cardData["phoneticDisplay"] = "No phonetics provided"
                }
                
                cardData["hasPhonetics"] = frontPhonetic.length > 0 || backPhonetic.length > 0
                cardData["isReversible"] = frontLanguage != backLanguage
                
                deckCards.append(cardData)
            }
        }
        
        cardId = cardId + 1
    }
    
    return deckCards
} 