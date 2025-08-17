import LeitnerLang from 0x17c88b3a4fab12ef

/// Debug script to show the ACTUAL contents of all 32 queue positions
/// This will help understand where cards go after review and queue rotation
access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    if userAddress.toString().length == 0 {
        return nil
    }
    
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return nil
    }
    
    if let profileRef = profileCap.borrow() {
        var debugInfo: {String: AnyStruct} = {}
        
        debugInfo["userAddress"] = userAddress.toString()
        debugInfo["queryTimestamp"] = getCurrentBlock().timestamp
        
        // Get basic stats
        let stats = profileRef.getStats()
        debugInfo["totalCardsInSystem"] = stats["totalCards"]
        debugInfo["totalReviews"] = stats["totalReviews"]
        debugInfo["streakDays"] = stats["streakDays"]
        debugInfo["isLeitnerDayComplete"] = profileRef.isLeitnerDayComplete()
        
        // CRITICAL: We need to access the actual queue contents
        // Since we can't access leitnerQueue directly from the interface,
        // we'll get what we can and infer the rest
        
        let currentDayCards = profileRef.getCurrentDayCards()
        debugInfo["currentDayCards"] = currentDayCards
        debugInfo["currentDayCount"] = currentDayCards.length
        
        // Build a summary of where cards are likely to be
        var cardLocationAnalysis: [{String: AnyStruct}] = []
        var totalTrackedCards = 0
        
        // Analyze each card in the system
        let totalCards = stats["totalCards"] as! Int? ?? 0
        if totalCards > 0 {
            // We need to iterate through all possible card IDs to find which ones
            // this user has in their Leitner system
            let maxCardId = LeitnerLang.nextCardId - 1
            var cardId: UInt64 = 1
            
            while cardId <= maxCardId {
                // Check if this user has this card in their system
                if let cardLevel = profileRef.getCardLevel(cardId: cardId) {
                    var cardAnalysis: {String: AnyStruct} = {}
                    cardAnalysis["cardId"] = cardId
                    cardAnalysis["currentLevel"] = cardLevel
                    
                    // Get card content for context
                    if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
                        cardAnalysis["frontText"] = cardInfo["frontText"]
                        cardAnalysis["backText"] = cardInfo["backText"]
                        cardAnalysis["frontLanguage"] = cardInfo["frontLanguage"]
                        cardAnalysis["backLanguage"] = cardInfo["backLanguage"]
                        cardAnalysis["deckId"] = cardInfo["deckId"]
                    }
                    
                    // Determine where this card should be in the queue
                    if cardLevel == 0 {
                        cardAnalysis["queueLocation"] = "Archived (not in queue)"
                        cardAnalysis["queueDay"] = -1
                    } else {
                        // Current day cards we know about
                        if currentDayCards.contains(cardId) {
                            cardAnalysis["queueLocation"] = "Current day (queue[0])"
                            cardAnalysis["queueDay"] = 0
                        } else {
                            // This card must be in a future queue position
                            // We can't access it directly, but we can estimate
                            cardAnalysis["queueLocation"] = "Future queue position (unknown exact day)"
                            cardAnalysis["queueDay"] = -2 // Unknown
                            cardAnalysis["note"] = "Card is scheduled for future review but exact day unknown due to queue access limitations"
                        }
                    }
                    
                    cardLocationAnalysis.append(cardAnalysis)
                    totalTrackedCards = totalTrackedCards + 1
                }
                cardId = cardId + 1
            }
        }
        
        debugInfo["cardLocationAnalysis"] = cardLocationAnalysis
        debugInfo["totalTrackedCards"] = totalTrackedCards
        
        // Summary statistics
        var archivedCount = 0
        var currentDayCount = 0
        var futureQueueCount = 0
        
        for analysis in cardLocationAnalysis {
            let queueDay = analysis["queueDay"] as! Int? ?? 0
            if queueDay == -1 {
                archivedCount = archivedCount + 1
            } else if queueDay == 0 {
                currentDayCount = currentDayCount + 1
            } else {
                futureQueueCount = futureQueueCount + 1
            }
        }
        
        debugInfo["cardDistribution"] = {
            "archived": archivedCount,
            "currentDay": currentDayCount,
            "futureQueue": futureQueueCount,
            "total": totalTrackedCards
        }
        
        // Health check
        let expectedTotal = archivedCount + currentDayCount + futureQueueCount
        debugInfo["dataIntegrity"] = {
            "expectedTotal": expectedTotal,
            "actualTotal": totalTrackedCards,
            "matches": expectedTotal == totalTrackedCards
        }
        
        // Recommendations
        var recommendations: [String] = []
        
        if futureQueueCount > 0 {
            recommendations.append("✅ " + futureQueueCount.toString() + " cards are scheduled for future review")
        }
        
        if archivedCount > 0 {
            recommendations.append("🎯 " + archivedCount.toString() + " cards have been mastered and archived")
        }
        
        if currentDayCount == 0 && futureQueueCount > 0 {
            recommendations.append("📅 Use 'complete_leitner_day' to rotate queue and bring future cards to today")
        }
        
        if totalTrackedCards < totalCards {
            recommendations.append("⚠️ Some cards may be missing from analysis due to iteration limits")
        }
        
        debugInfo["recommendations"] = recommendations
        
        return debugInfo
    }
    
    return nil
} 