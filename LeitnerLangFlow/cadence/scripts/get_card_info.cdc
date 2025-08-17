import LeitnerLang from 0x17c88b3a4fab12ef

/// Gets comprehensive card information by card ID
/// Returns nil if card doesn't exist
access(all) fun main(cardId: UInt64): {String: AnyStruct}? {
    // Validate input
    if cardId == 0 {
        return nil
    }
    
    // Get card information from contract
    let cardInfo = LeitnerLang.getCardInfo(cardId: cardId)
    
    // Return nil if card doesn't exist
    if cardInfo == nil {
        return nil
    }
    
    // Create enhanced card information
    var enhancedInfo: {String: AnyStruct} = {}
    
    // Copy basic card information
    enhancedInfo["id"] = cardInfo!["id"]
    enhancedInfo["frontText"] = cardInfo!["frontText"]
    enhancedInfo["frontPhonetic"] = cardInfo!["frontPhonetic"]
    enhancedInfo["frontLanguage"] = cardInfo!["frontLanguage"]
    enhancedInfo["backText"] = cardInfo!["backText"]
    enhancedInfo["backPhonetic"] = cardInfo!["backPhonetic"]
    enhancedInfo["backLanguage"] = cardInfo!["backLanguage"]
    enhancedInfo["deckId"] = cardInfo!["deckId"]
    enhancedInfo["createdAt"] = cardInfo!["createdAt"]
    
    // Add enhanced information
    let frontText = cardInfo!["frontText"] as! String? ?? ""
    let backText = cardInfo!["backText"] as! String? ?? ""
    let frontLanguage = cardInfo!["frontLanguage"] as! String? ?? ""
    let backLanguage = cardInfo!["backLanguage"] as! String? ?? ""
    let frontPhonetic = cardInfo!["frontPhonetic"] as! String? ?? ""
    let backPhonetic = cardInfo!["backPhonetic"] as! String? ?? ""
    let createdAt = cardInfo!["createdAt"] as! UFix64? ?? 0.0
    let deckId = cardInfo!["deckId"] as! UInt64? ?? 0
    
    // Language pair display
    enhancedInfo["languagePair"] = frontLanguage.concat(" → ").concat(backLanguage)
    enhancedInfo["displayText"] = frontText.concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")")
    
    // Phonetic display
    if frontPhonetic.length > 0 && backPhonetic.length > 0 {
        enhancedInfo["phoneticDisplay"] = frontPhonetic.concat(" → ").concat(backPhonetic)
    } else if frontPhonetic.length > 0 {
        enhancedInfo["phoneticDisplay"] = frontPhonetic.concat(" → (no phonetic)")
    } else if backPhonetic.length > 0 {
        enhancedInfo["phoneticDisplay"] = "(no phonetic) → ".concat(backPhonetic)
    } else {
        enhancedInfo["phoneticDisplay"] = "No phonetics provided"
    }
    
    // Card status
    enhancedInfo["hasPhonetics"] = frontPhonetic.length > 0 || backPhonetic.length > 0
    enhancedInfo["isReversible"] = frontLanguage != backLanguage
    
    // Get deck information for context
    if let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId) {
        enhancedInfo["deckConcept"] = deckInfo["concept"]
        enhancedInfo["deckMeaning"] = deckInfo["meaning"]
    }
    
    // Calculate days since creation
    let currentTime = getCurrentBlock().timestamp
    let daysSinceCreation = (currentTime - createdAt) / 86400.0
    enhancedInfo["daysSinceCreation"] = daysSinceCreation
    enhancedInfo["ageCategory"] = getAgeCategory(days: daysSinceCreation)
    
    // Add metadata
    enhancedInfo["queryTimestamp"] = currentTime
    
    return enhancedInfo
}

/// Helper function to categorize card age
access(all) fun getAgeCategory(days: UFix64): String {
    if days < 1.0 {
        return "Brand New"
    } else if days < 7.0 {
        return "Recent"
    } else if days < 30.0 {
        return "Established"
    } else {
        return "Mature"
    }
} 