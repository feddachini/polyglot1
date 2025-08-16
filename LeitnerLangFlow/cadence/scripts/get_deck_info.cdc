import "LeitnerLang"

/// Gets comprehensive deck information including details and statistics
/// Returns nil if deck doesn't exist
access(all) fun main(deckId: UInt64): {String: AnyStruct}? {
    // Validate input
    if deckId == 0 {
        return nil
    }
    
    // Get deck information from contract
    let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
    
    // Return nil if deck doesn't exist
    if deckInfo == nil {
        return nil
    }
    
    // Create enhanced deck information
    var enhancedInfo: {String: AnyStruct} = {}
    
    // Copy basic deck information (updated structure)
    enhancedInfo["id"] = deckInfo!["id"]
    enhancedInfo["concept"] = deckInfo!["concept"]
    enhancedInfo["meaning"] = deckInfo!["meaning"]
    enhancedInfo["createdAt"] = deckInfo!["createdAt"]
    enhancedInfo["creator"] = deckInfo!["creator"]
    
    // Add enhanced information
    let concept = deckInfo!["concept"] as! String? ?? ""
    let meaning = deckInfo!["meaning"] as! String? ?? ""
    let createdAt = deckInfo!["createdAt"] as! UFix64? ?? 0.0
    
    // Concept display
    enhancedInfo["conceptMeaning"] = concept.concat(": ").concat(meaning)
    
    // Deck status based on concept length and meaning
    var deckStatus = "New Concept"
    if concept.length > 0 && meaning.length > 10 {
        deckStatus = "Well Defined"
    } else if concept.length > 0 {
        deckStatus = "Basic Concept"
    }
    enhancedInfo["deckStatus"] = deckStatus
    
    // Difficulty estimation based on concept complexity
    var difficultyLevel = "Beginner"
    if concept.length > 10 || meaning.length > 50 {
        difficultyLevel = "Intermediate"
    }
    if concept.length > 20 || meaning.length > 100 {
        difficultyLevel = "Advanced"
    }
    enhancedInfo["estimatedDifficulty"] = difficultyLevel
    
    // Calculate days since creation
    let currentTime = getCurrentBlock().timestamp
    let daysSinceCreation = (currentTime - createdAt) / 86400.0 // seconds in a day
    enhancedInfo["daysSinceCreation"] = daysSinceCreation
    enhancedInfo["ageCategory"] = getAgeCategory(days: daysSinceCreation)
    
    // Add learning estimates for multilingual concepts
    enhancedInfo["estimatedLanguagePairs"] = 6  // Estimate for common concept
    enhancedInfo["estimatedStudyTimeMinutes"] = 30 // Base estimate per concept
    enhancedInfo["conceptComplexity"] = concept.length > 15 ? "Complex" : "Simple"
    
    // Add metadata
    enhancedInfo["hasValidConcept"] = concept.length > 0
    enhancedInfo["hasDetailedMeaning"] = meaning.length > 20
    enhancedInfo["queryTimestamp"] = currentTime
    
    // Concept categorization
    enhancedInfo["conceptCategory"] = getCategoryFromConcept(concept: concept)
    
    return enhancedInfo
}

/// Helper function to categorize deck age
access(all) fun getAgeCategory(days: UFix64): String {
    if days < 1.0 {
        return "Brand New"
    } else if days < 7.0 {
        return "Recent"
    } else if days < 30.0 {
        return "Established"
    } else if days < 90.0 {
        return "Mature"
    } else {
        return "Veteran"
    }
}

/// Helper function to determine concept category
access(all) fun getCategoryFromConcept(concept: String): String {
    let lowerConcept = concept.toLower()
    
    // Basic categorization based on concept content
    if lowerConcept.contains("greeting") || lowerConcept.contains("hello") || lowerConcept.contains("hi") {
        return "Greetings & Social"
    } else if lowerConcept.contains("number") || lowerConcept.contains("count") || lowerConcept.contains("math") {
        return "Numbers & Math"
    } else if lowerConcept.contains("color") || lowerConcept.contains("colour") {
        return "Colors & Appearance"
    } else if lowerConcept.contains("food") || lowerConcept.contains("eat") || lowerConcept.contains("drink") {
        return "Food & Dining"
    } else if lowerConcept.contains("family") || lowerConcept.contains("parent") || lowerConcept.contains("child") {
        return "Family & Relationships"
    } else if lowerConcept.contains("time") || lowerConcept.contains("day") || lowerConcept.contains("hour") {
        return "Time & Calendar"
    } else if lowerConcept.contains("travel") || lowerConcept.contains("transport") || lowerConcept.contains("direction") {
        return "Travel & Directions"
    } else {
        return "General Vocabulary"
    }
}
