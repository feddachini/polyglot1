import LeitnerLang from 0x17c88b3a4fab12ef

/// Gets all existing card IDs with basic information
/// Returns an array of card summaries
access(all) fun main(): [{String: AnyStruct}] {
    var cardSummaries: [{String: AnyStruct}] = []
    
    // Get the current max card ID (nextCardId - 1)
    let maxCardId = LeitnerLang.nextCardId - 1
    
    // Iterate through all possible card IDs starting from 1
    var cardId: UInt64 = 1
    while cardId <= maxCardId {
        // Try to get card information
        if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
            var summary: {String: AnyStruct} = {}
            
            summary["id"] = cardId
            summary["frontText"] = cardInfo["frontText"]
            summary["backText"] = cardInfo["backText"]
            summary["frontLanguage"] = cardInfo["frontLanguage"]
            summary["backLanguage"] = cardInfo["backLanguage"]
            summary["deckId"] = cardInfo["deckId"]
            summary["createdAt"] = cardInfo["createdAt"]
            
            // Calculate age
            let createdAt = cardInfo["createdAt"] as! UFix64? ?? 0.0
            let currentTime = getCurrentBlock().timestamp
            let daysSinceCreation = (currentTime - createdAt) / 86400.0
            summary["daysSinceCreation"] = daysSinceCreation
            
            // Add display text
            let frontText = cardInfo["frontText"] as! String? ?? ""
            let backText = cardInfo["backText"] as! String? ?? ""
            let frontLanguage = cardInfo["frontLanguage"] as! String? ?? ""
            let backLanguage = cardInfo["backLanguage"] as! String? ?? ""
            summary["displayText"] = frontText.concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")")
            
            // Language pair
            summary["languagePair"] = frontLanguage.concat(" → ").concat(backLanguage)
            
            cardSummaries.append(summary)
        }
        
        cardId = cardId + 1
    }
    
    return cardSummaries
} 