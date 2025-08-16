import "LeitnerLang"

/// Gets detailed Leitner queue information for a user
/// Returns comprehensive queue state with card scheduling and analytics
access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    // Validate input address
    if userAddress.toString().length == 0 {
        return nil
    }
    
    // Get the user's account
    let account = getAccount(userAddress)
    
    // Try to get the profile capability
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    // Check if capability is valid and can be borrowed
    if !profileCap.check() {
        return nil
    }
    
    // Borrow the profile reference
    if let profileRef = profileCap.borrow() {
        var queueInfo: {String: AnyStruct} = {}
        
        // Basic queue information
        queueInfo["userAddress"] = userAddress.toString()
        queueInfo["queryTimestamp"] = getCurrentBlock().timestamp
        
        // Get current day cards (queue[0])
        let currentDayCards = profileRef.getCurrentDayCards()
        queueInfo["currentDayCards"] = currentDayCards
        queueInfo["currentDayCount"] = currentDayCards.length
        queueInfo["isLeitnerDayComplete"] = profileRef.isLeitnerDayComplete()
        
        // Get profile stats for context
        let stats = profileRef.getStats()
        queueInfo["totalCards"] = stats["totalCards"]
        queueInfo["totalReviews"] = stats["totalReviews"]
        queueInfo["streakDays"] = stats["streakDays"]
        
        // Build detailed queue structure (32 days)
        var queueStructure: [{String: AnyStruct}] = []
        var totalScheduledCards = 0
        var scheduledDays = 0
        
        // Note: We can't directly access leitnerQueue from the contract interface,
        // but we can provide information about the current day and general queue state
        
        // Day 0 (current day) information
        var currentDayInfo: {String: AnyStruct} = {}
        currentDayInfo["day"] = 0
        currentDayInfo["description"] = "Current Day (Due Now)"
        currentDayInfo["cardIds"] = currentDayCards
        currentDayInfo["cardCount"] = currentDayCards.length
        currentDayInfo["isCurrentDay"] = true
        
        // Add detailed card information for current day
        var currentDayCardDetails: [{String: AnyStruct}] = []
        for cardId in currentDayCards {
            var cardDetail: {String: AnyStruct} = {}
            cardDetail["cardId"] = cardId
            
            // Get card level and info
            if let level = profileRef.getCardLevel(cardId: cardId) {
                cardDetail["level"] = level
                cardDetail["levelDescription"] = getLevelDescription(level: level)
                
                // Get card content if available
                if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
                    cardDetail["frontText"] = cardInfo["frontText"]
                    cardDetail["backText"] = cardInfo["backText"]
                    cardDetail["frontLanguage"] = cardInfo["frontLanguage"]
                    cardDetail["backLanguage"] = cardInfo["backLanguage"]
                    
                    let frontText = cardInfo["frontText"] as! String? ?? ""
                    let backText = cardInfo["backText"] as! String? ?? ""
                    let frontLang = cardInfo["frontLanguage"] as! String? ?? ""
                    let backLang = cardInfo["backLanguage"] as! String? ?? ""
                    cardDetail["displayText"] = frontText.concat(" (").concat(frontLang).concat(") → ").concat(backText).concat(" (").concat(backLang).concat(")")
                }
            }
            currentDayCardDetails.append(cardDetail)
        }
        currentDayInfo["cardDetails"] = currentDayCardDetails
        
        queueStructure.append(currentDayInfo)
        
        if currentDayCards.length > 0 {
            totalScheduledCards = totalScheduledCards + currentDayCards.length
            scheduledDays = scheduledDays + 1
        }
        
        // Future days (1-31) - we can't access them directly, so provide estimated structure
        var day = 1
        while day < 32 {
            var dayInfo: {String: AnyStruct} = {}
            dayInfo["day"] = day
            dayInfo["description"] = "Day +".concat(day.toString()).concat(" (Future)")
            dayInfo["cardIds"] = [] // We can't access future queue slots directly
            dayInfo["cardCount"] = 0 // Unknown without direct access
            dayInfo["isCurrentDay"] = false
            dayInfo["estimatedInterval"] = getIntervalForDay(day: day)
            dayInfo["note"] = "Queue slot for cards reviewed today with correct answers at specific levels"
            
            queueStructure.append(dayInfo)
            day = day + 1
        }
        
        queueInfo["queueStructure"] = queueStructure
        queueInfo["totalScheduledCards"] = totalScheduledCards
        queueInfo["scheduledDays"] = scheduledDays
        queueInfo["emptyDays"] = 32 - scheduledDays
        
        // Queue analytics
        queueInfo["queueEfficiency"] = totalScheduledCards > 0 ? (UFix64(scheduledDays) / 32.0) * 100.0 : 0.0
        queueInfo["averageCardsPerActiveDay"] = scheduledDays > 0 ? UFix64(totalScheduledCards) / UFix64(scheduledDays) : 0.0
        
        // Learning recommendations based on queue state
        if currentDayCards.length == 0 {
            queueInfo["recommendation"] = "🎉 Current day complete! Queue will rotate when you add more cards or complete a review session."
            queueInfo["status"] = "Day Complete"
        } else if currentDayCards.length <= 5 {
            queueInfo["recommendation"] = "📚 Light study day - perfect for focused learning!"
            queueInfo["status"] = "Light Load"
        } else if currentDayCards.length <= 15 {
            queueInfo["recommendation"] = "📖 Normal study session - good learning pace."
            queueInfo["status"] = "Normal Load"
        } else {
            queueInfo["recommendation"] = "📚 Heavy study day - consider breaking into multiple sessions."
            queueInfo["status"] = "Heavy Load"
        }
        
        // Next steps guidance
        if currentDayCards.length > 0 {
            queueInfo["nextAction"] = "Review ".concat(currentDayCards.length.toString()).concat(" cards using review_card transaction")
        } else {
            queueInfo["nextAction"] = "Add more cards to your Leitner system or wait for future scheduled cards"
        }
        
        return queueInfo
    }
    
    return nil
}

/// Helper function to get level description
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

/// Helper function to estimate which intervals might place cards in specific days
access(all) fun getIntervalForDay(day: Int): String {
    // Leitner intervals: [1, 2, 4, 8, 16, 32] days
    switch day {
        case 1: return "Level 1 cards (1 day interval)"
        case 2: return "Level 2 cards (2 day interval)"
        case 4: return "Level 3 cards (4 day interval)"
        case 8: return "Level 4 cards (8 day interval)"
        case 16: return "Level 5 cards (16 day interval)"
        case 32: return "Level 6 cards (32 day interval) - wraps to day 0"
        default: return "Overflow from longer intervals (modulo 32)"
    }
} 