import "LeitnerLang"

/// Gets detailed card level information for a specific user and card
/// Returns comprehensive card progress information for queue-based system or nil if not found
access(all) fun main(userAddress: Address, cardId: UInt64): {String: AnyStruct}? {
    // Validate inputs
    if userAddress.toString().length == 0 {
        return nil
    }
    
    if cardId == 0 {
        return nil
    }
    
    // Get the user's account
    let account = getAccount(userAddress)
    
    // Try to get the profile capability
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    // Check if capability is valid and can be borrowed
    if !profileCap.check() {
        // Profile not setup, return nil
        return nil
    }
    
    // Borrow the profile reference
    if let profileRef = profileCap.borrow() {
        // Get card level from user's profile
        let cardLevel = profileRef.getCardLevel(cardId: cardId)
        
        // If card is not in user's Leitner system, return nil
        if cardLevel == nil {
            return nil
        }
        
        // Create comprehensive card level information
        var cardLevelInfo: {String: AnyStruct} = {}
        
        // Basic information
        cardLevelInfo["userAddress"] = userAddress.toString()
        cardLevelInfo["cardId"] = cardId
        cardLevelInfo["currentLevel"] = cardLevel!
        
        // Level description and progression for queue system
        cardLevelInfo["levelDescription"] = getLevelDescription(level: cardLevel!)
        cardLevelInfo["levelName"] = getLevelName(level: cardLevel!)
        
        // Next level information (handling level 0 archive)
        let nextLevel: UInt8 = cardLevel! == 7 ? 0 : (cardLevel! < 7 ? cardLevel! + 1 : cardLevel!)
        cardLevelInfo["nextLevel"] = nextLevel
        cardLevelInfo["nextLevelDescription"] = getLevelDescription(level: nextLevel)
        cardLevelInfo["nextLevelName"] = getLevelName(level: nextLevel)
        
        // Progress information (level 0 = 100% mastered)
        cardLevelInfo["progressPercentage"] = calculateProgressPercentage(level: cardLevel!)
        cardLevelInfo["isArchived"] = cardLevel! == 0
        cardLevelInfo["isMaxLevel"] = cardLevel! == 7
        cardLevelInfo["canAdvance"] = cardLevel! > 0 && cardLevel! < 7
        
        // Queue-based scheduling information
        let cardsDueToday = profileRef.getCardsDueForReview()
        cardLevelInfo["isCurrentlyDue"] = cardsDueToday.contains(cardId)
        cardLevelInfo["queueStatus"] = cardsDueToday.contains(cardId) ? "Due Today" : "Scheduled"
        
        // Leitner interval information for queue system
        if cardLevel! > 0 && cardLevel! <= 6 {
            let intervals = [1, 2, 4, 8, 16, 32]
            let currentInterval = intervals[cardLevel! - 1]
            cardLevelInfo["currentLeitnerInterval"] = currentInterval
            cardLevelInfo["currentIntervalDays"] = currentInterval
            cardLevelInfo["intervalDescription"] = currentInterval.toString().concat(" Leitner days")
            
            // Next interval (if not going to be archived)
            if nextLevel > 0 && nextLevel <= 6 {
                let nextInterval = intervals[nextLevel - 1]
                cardLevelInfo["nextLeitnerInterval"] = nextInterval
                cardLevelInfo["nextIntervalDays"] = nextInterval
                cardLevelInfo["nextIntervalDescription"] = nextInterval.toString().concat(" Leitner days")
            } else if nextLevel == 0 {
                cardLevelInfo["nextLeitnerInterval"] = 0
                cardLevelInfo["nextIntervalDays"] = 0
                cardLevelInfo["nextIntervalDescription"] = "Archived (no more reviews)"
            }
        } else if cardLevel! == 7 {
            cardLevelInfo["currentLeitnerInterval"] = 64
            cardLevelInfo["currentIntervalDays"] = 64
            cardLevelInfo["intervalDescription"] = "Expert level (will be archived)"
            cardLevelInfo["nextLeitnerInterval"] = 0
            cardLevelInfo["nextIntervalDays"] = 0
            cardLevelInfo["nextIntervalDescription"] = "Will be archived after next correct review"
        } else if cardLevel! == 0 {
            cardLevelInfo["currentLeitnerInterval"] = 0
            cardLevelInfo["currentIntervalDays"] = 0
            cardLevelInfo["intervalDescription"] = "Archived (learned)"
            cardLevelInfo["nextLeitnerInterval"] = 0
            cardLevelInfo["nextIntervalDays"] = 0
            cardLevelInfo["nextIntervalDescription"] = "Remains archived"
        }
        
        // Study recommendations for queue system
        cardLevelInfo["studyRecommendation"] = getQueueStudyRecommendation(level: cardLevel!)
        cardLevelInfo["reviewPriority"] = getReviewPriority(level: cardLevel!)
        
        // Mastery assessment
        cardLevelInfo["masteryLevel"] = getMasteryLevel(level: cardLevel!)
        cardLevelInfo["masteryDescription"] = getMasteryDescription(level: cardLevel!)
        
        // Learning statistics
        cardLevelInfo["learningStage"] = getLearningStage(level: cardLevel!)
        if cardLevel! == 0 {
            cardLevelInfo["remainingReviews"] = 0
        } else {
            let remaining = 7 - Int(cardLevel!)
            cardLevelInfo["remainingReviews"] = remaining
        }
        
        // Add timestamp
        cardLevelInfo["queryTimestamp"] = getCurrentBlock().timestamp
        
        return cardLevelInfo
    }
    
    // If we reach here, borrowing failed
    return nil
}

/// Helper function to get level description for queue system
access(all) fun getLevelDescription(level: UInt8): String {
    switch level {
        case 0: return "Archived (learned)"
        case 1: return "New card (1 Leitner day)"
        case 2: return "Learning (2 Leitner days)"
        case 3: return "Familiar (4 Leitner days)"
        case 4: return "Known (8 Leitner days)"
        case 5: return "Well known (16 Leitner days)"
        case 6: return "Mastered (32 Leitner days)"
        case 7: return "Expert (will be archived)"
        default: return "Unknown level"
    }
}

/// Helper function to get level name
access(all) fun getLevelName(level: UInt8): String {
    switch level {
        case 0: return "Archived"
        case 1: return "Beginner"
        case 2: return "Learning"
        case 3: return "Familiar"
        case 4: return "Known"
        case 5: return "Well Known"
        case 6: return "Mastered"
        case 7: return "Expert"
        default: return "Unknown"
    }
}

/// Helper function to calculate progress percentage (level 0 = 100%)
access(all) fun calculateProgressPercentage(level: UInt8): UFix64 {
    if level == 0 {
        return 100.0  // Archived = fully learned
    } else if level >= 7 {
        return 95.0   // Expert level, almost archived
    } else {
        return (UFix64(level) / 7.0) * 95.0  // Scale to 95% max before archive
    }
}

/// Helper function to get study recommendation for queue system
access(all) fun getQueueStudyRecommendation(level: UInt8): String {
    switch level {
        case 0: return "No review needed - card is learned and archived"
        case 1: return "Focus on this new card - needs frequent practice"
        case 2: return "Practice this learning card carefully"
        case 3: return "Review this familiar card confidently"
        case 4: return "Quick review of this known card"
        case 5: return "Brief check of this well-known card"
        case 6: return "Final review of this mastered card"
        case 7: return "Last review before archiving - almost learned!"
        default: return "Review this card"
    }
}

/// Helper function to get review priority
access(all) fun getReviewPriority(level: UInt8): String {
    switch level {
        case 0: return "No Priority - Archived"
        case 1: return "High Priority - New Card"
        case 2: return "High Priority - Learning"
        case 3: return "Medium Priority - Familiar"
        case 4: return "Medium Priority - Known"
        case 5: return "Low Priority - Well Known"
        case 6: return "Low Priority - Mastered"
        case 7: return "Final Review Priority"
        default: return "Unknown Priority"
    }
}

/// Helper function to get mastery level
access(all) fun getMasteryLevel(level: UInt8): String {
    if level == 0 {
        return "Fully Mastered"
    } else if level <= 2 {
        return "Novice"
    } else if level <= 4 {
        return "Intermediate"
    } else if level <= 6 {
        return "Advanced"
    } else {
        return "Expert"
    }
}

/// Helper function to get mastery description
access(all) fun getMasteryDescription(level: UInt8): String {
    switch level {
        case 0: return "This card has been fully learned and archived"
        case 1: return "Just starting to learn this card"
        case 2: return "Beginning to remember this card"
        case 3: return "Getting familiar with this card"
        case 4: return "This card is becoming well known"
        case 5: return "This card is well established in memory"
        case 6: return "This card has been mastered"
        case 7: return "Expert level - one step away from archiving"
        default: return "Unknown mastery level"
    }
}

/// Helper function to get learning stage
access(all) fun getLearningStage(level: UInt8): String {
    if level == 0 {
        return "Completed"
    } else if level >= 1 && level <= 2 {
        return "Acquisition"
    } else if level >= 3 && level <= 4 {
        return "Consolidation"
    } else if level >= 5 && level <= 6 {
        return "Mastery"
    } else if level == 7 {
        return "Expertise"
    } else {
        return "Unknown"
    }
}
