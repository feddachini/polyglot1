import "LeitnerLang"

/// Gets cards that are due for review for a specific user with detailed information
/// Returns an array of card information for current Leitner day (queue-based system)
access(all) fun main(userAddress: Address): [{String: AnyStruct}] {
    // Validate input address
    if userAddress.toString().length == 0 {
        return []
    }
    
    // Get the user's account
    let account = getAccount(userAddress)
    
    // Try to get the profile capability
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    // Check if capability is valid and can be borrowed
    if !profileCap.check() {
        // Profile not setup, return empty array
        return []
    }
    
    // Borrow the profile reference
    if let profileRef = profileCap.borrow() {
        // Get cards due for review (current day from queue)
        let cardsDueIds = profileRef.getCardsDueForReview()
        
        // If no cards are due, return empty array
        if cardsDueIds.length == 0 {
            return []
        }
        
        var cardsDueInfo: [{String: AnyStruct}] = []
        
        // Get detailed information for each card due for review
        for cardId in cardsDueIds {
            var cardInfo: {String: AnyStruct} = {}
            
            // Basic card information
            cardInfo["cardId"] = cardId
            cardInfo["userAddress"] = userAddress.toString()
            
            // Get card level information
            if let level = profileRef.getCardLevel(cardId: cardId) {
                cardInfo["currentLevel"] = level
                
                // Calculate level description for queue system
                let levelDescription = getLevelDescription(level: level)
                cardInfo["levelDescription"] = levelDescription
                
                // Calculate next level description (handling level 0 archive)
                let nextLevel: UInt8 = level == 7 ? 0 : (level < 7 ? level + 1 : level)
                cardInfo["nextLevel"] = nextLevel
                cardInfo["nextLevelDescription"] = getLevelDescription(level: nextLevel)
                
                // Queue-based scheduling info
                if level <= 6 && level > 0 {
                    let intervals = [1, 2, 4, 8, 16, 32]
                    let currentInterval = intervals[level - 1]
                    cardInfo["currentLeitnerInterval"] = currentInterval
                    cardInfo["intervalDescription"] = currentInterval.toString().concat(" Leitner days")
                    
                    if nextLevel <= 6 && nextLevel > 0 {
                        let nextInterval = intervals[nextLevel - 1]
                        cardInfo["nextLeitnerInterval"] = nextInterval
                        cardInfo["nextIntervalDescription"] = nextInterval.toString().concat(" Leitner days")
                    } else if nextLevel == 0 {
                        cardInfo["nextLeitnerInterval"] = 0
                        cardInfo["nextIntervalDescription"] = "Archived (learned)"
                    }
                } else if level == 0 {
                    cardInfo["currentLeitnerInterval"] = 0
                    cardInfo["intervalDescription"] = "Archived (learned)"
                    cardInfo["nextLeitnerInterval"] = 0
                    cardInfo["nextIntervalDescription"] = "Remains archived"
                }
            } else {
                cardInfo["currentLevel"] = 1
                cardInfo["levelDescription"] = "New card"
                cardInfo["nextLevel"] = 2
                cardInfo["nextLevelDescription"] = "Learning (2 Leitner days)"
                cardInfo["currentLeitnerInterval"] = 1
                cardInfo["intervalDescription"] = "1 Leitner day"
                cardInfo["nextLeitnerInterval"] = 2
                cardInfo["nextIntervalDescription"] = "2 Leitner days"
            }
            
            // Review status for queue system
            cardInfo["reviewStatus"] = "Due Now"
            cardInfo["queuePosition"] = "Current Day"
            cardInfo["isCurrentDay"] = true
            
            // Calculate priority (lower level = higher priority for review)
            let level = cardInfo["currentLevel"] as! UInt8? ?? 1
            let priority = level == 0 ? 0 : (8 - Int(level)) // Archived cards have lowest priority (0)
            cardInfo["reviewPriority"] = priority
            cardInfo["priorityDescription"] = getPriorityDescription(level: level)
            
            // Add mastery information
            cardInfo["masteryLevel"] = getMasteryLevel(level: level)
            cardInfo["masteryDescription"] = getMasteryDescription(level: level)
            
            // Study recommendation for queue system
            cardInfo["studyRecommendation"] = getQueueStudyRecommendation(level: level)
            
            cardsDueInfo.append(cardInfo)
        }
        
        // Sort by priority (highest priority first)
        cardsDueInfo = sortCardsByPriority(cards: cardsDueInfo)
        
        return cardsDueInfo
    }
    
    // If we reach here, borrowing failed
    return []
}

/// Helper function to get level description for queue system
access(all) fun getLevelDescription(level: UInt8): String {
    switch level {
        case 0: return "Archived (learned)"
        case 1: return "New (1 Leitner day)"
        case 2: return "Learning (2 Leitner days)"
        case 3: return "Familiar (4 Leitner days)"
        case 4: return "Known (8 Leitner days)"
        case 5: return "Well known (16 Leitner days)"
        case 6: return "Mastered (32 Leitner days)"
        case 7: return "Expert (will be archived)"
        default: return "Unknown level"
    }
}

/// Helper function to get priority description
access(all) fun getPriorityDescription(level: UInt8): String {
    switch level {
        case 0: return "Archived - No Review Needed"
        case 1: return "High Priority - New Card"
        case 2: return "High Priority - Learning"
        case 3: return "Medium Priority - Familiar"
        case 4: return "Medium Priority - Known"
        case 5: return "Low Priority - Well Known"
        case 6: return "Low Priority - Mastered"
        case 7: return "Ready for Archive"
        default: return "Unknown Priority"
    }
}

/// Helper function to get mastery level
access(all) fun getMasteryLevel(level: UInt8): String {
    if level == 0 {
        return "Mastered"
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
        case 0: return "This card has been mastered and archived"
        case 1: return "Just starting to learn this card"
        case 2: return "Beginning to remember this card"
        case 3: return "Getting familiar with this card"
        case 4: return "This card is becoming well known"
        case 5: return "This card is well established in memory"
        case 6: return "This card has been mastered"
        case 7: return "Expert level - ready for archive"
        default: return "Unknown mastery level"
    }
}

/// Helper function to get study recommendation for queue system
access(all) fun getQueueStudyRecommendation(level: UInt8): String {
    switch level {
        case 0: return "No review needed - card is archived"
        case 1: return "Focus on this new card - needs reinforcement"
        case 2: return "Practice this learning card carefully"
        case 3: return "Review this familiar card confidently"
        case 4: return "Quick review of this known card"
        case 5: return "Brief check of this well-known card"
        case 6: return "Final review of this mastered card"
        case 7: return "Last review before archiving"
        default: return "Review this card"
    }
}

/// Helper function to sort cards by priority
access(all) fun sortCardsByPriority(cards: [{String: AnyStruct}]): [{String: AnyStruct}] {
    // Note: Cadence doesn't have built-in sorting, so we'll return as-is
    // Priority is set correctly for frontend sorting if needed
    return cards
}
