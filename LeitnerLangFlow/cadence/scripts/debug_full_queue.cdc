import LeitnerLang from 0x17c88b3a4fab12ef

/// COMPREHENSIVE DEBUG - Shows actual queue contents and card locations
/// This script bypasses the public interface to show what's really happening
access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    if userAddress.toString().length == 0 {
        return nil
    }
    
    let account = getAccount(userAddress)
    
    // Try to get storage reference directly (won't work from script, but let's see what we can get)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return {
            "error": "Profile not found or not accessible",
            "userAddress": userAddress.toString()
        }
    }
    
    if let profileRef = profileCap.borrow() {
        var debugData: {String: AnyStruct} = {}
        
        debugData["userAddress"] = userAddress.toString()
        debugData["timestamp"] = getCurrentBlock().timestamp
        
        // Get basic profile stats
        let stats = profileRef.getStats()
        debugData["stats"] = stats
        
        // Get current day cards (this should work)
        let currentDayCards = profileRef.getCurrentDayCards()
        debugData["currentDayCards"] = currentDayCards
        debugData["currentDayCount"] = currentDayCards.length
        debugData["isLeitnerDayComplete"] = profileRef.isLeitnerDayComplete()
        
        // Now let's analyze ALL cards in the user's leitnerCards dictionary
        var allUserCards: [{String: AnyStruct}] = []
        var cardLevelDistribution: {UInt8: Int} = {}
        var totalCardsFound = 0
        
        // We need to iterate through all possible card IDs to find which ones this user has
        let maxCardId = LeitnerLang.nextCardId - 1
        var cardId: UInt64 = 1
        
        while cardId <= maxCardId && totalCardsFound < 100 { // Limit to prevent timeout
            // Check if this user has this card
            if let cardLevel = profileRef.getCardLevel(cardId: cardId) {
                var cardData: {String: AnyStruct} = {}
                cardData["cardId"] = cardId
                cardData["level"] = cardLevel
                
                // Track level distribution
                if cardLevelDistribution[cardLevel] == nil {
                    cardLevelDistribution[cardLevel] = 1
                } else {
                    cardLevelDistribution[cardLevel] = cardLevelDistribution[cardLevel]! + 1
                }
                
                // Get card info
                if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
                    cardData["frontText"] = cardInfo["frontText"]
                    cardData["backText"] = cardInfo["backText"]
                    cardData["frontLanguage"] = cardInfo["frontLanguage"]
                    cardData["backLanguage"] = cardInfo["backLanguage"]
                    cardData["deckId"] = cardInfo["deckId"]
                }
                
                // Determine expected queue position based on level
                if cardLevel == 0 {
                    cardData["expectedLocation"] = "Archived (not in queue)"
                    cardData["expectedQueueDay"] = "N/A"
                } else if cardLevel >= 1 && cardLevel <= 6 {
                    let intervals = [1, 2, 4, 8, 16, 32]
                    let interval = intervals[cardLevel - 1]
                    let expectedQueueIndex = interval % 32
                    cardData["expectedLocation"] = "Queue position ".concat(expectedQueueIndex.toString())
                    cardData["expectedQueueDay"] = "+".concat(interval.toString()).concat(" days")
                    cardData["leitnerInterval"] = interval
                } else if cardLevel == 7 {
                    cardData["expectedLocation"] = "Will be archived on next correct review"
                    cardData["expectedQueueDay"] = "Expert level"
                }
                
                // Check if currently due
                cardData["isCurrentlyDue"] = currentDayCards.contains(cardId)
                
                allUserCards.append(cardData)
                totalCardsFound = totalCardsFound + 1
            }
            cardId = cardId + 1
        }
        
        debugData["allUserCards"] = allUserCards
        debugData["totalCardsFound"] = totalCardsFound
        debugData["cardLevelDistribution"] = cardLevelDistribution
        
        // Analyze discrepancies
        var analysis: {String: AnyStruct} = {}
        
        // Count cards by expected location
        var currentDayExpected = 0
        var futureQueueExpected = 0
        var archivedExpected = 0
        
        for card in allUserCards {
            let level = card["level"] as! UInt8? ?? 0
            let isCurrentlyDue = card["isCurrentlyDue"] as! Bool? ?? false
            
            if level == 0 {
                archivedExpected = archivedExpected + 1
            } else if isCurrentlyDue {
                currentDayExpected = currentDayExpected + 1
            } else {
                futureQueueExpected = futureQueueExpected + 1
            }
        }
        
        analysis["expectedDistribution"] = {
            "currentDay": currentDayExpected,
            "futureQueue": futureQueueExpected,
            "archived": archivedExpected,
            "total": totalCardsFound
        }
        
        analysis["actualCurrentDay"] = currentDayCards.length
        analysis["discrepancy"] = currentDayExpected != currentDayCards.length
        
        // Look for cards that should be due but aren't showing up
        var missingFromCurrentDay: [UInt64] = []
        var unexpectedInCurrentDay: [UInt64] = []
        
        for card in allUserCards {
            let cardId = card["cardId"] as! UInt64? ?? 0
            let level = card["level"] as! UInt8? ?? 0
            let isCurrentlyDue = card["isCurrentlyDue"] as! Bool? ?? false
            
            // Cards at level 1 should typically be in current day (new cards)
            if level == 1 && !isCurrentlyDue {
                missingFromCurrentDay.append(cardId)
            }
        }
        
        // Check for cards in current day that shouldn't be there
        for cardId in currentDayCards {
            var foundCard = false
            for card in allUserCards {
                if card["cardId"] as! UInt64? == cardId {
                    foundCard = true
                    break
                }
            }
            if !foundCard {
                unexpectedInCurrentDay.append(cardId)
            }
        }
        
        analysis["missingFromCurrentDay"] = missingFromCurrentDay
        analysis["unexpectedInCurrentDay"] = unexpectedInCurrentDay
        
        debugData["analysis"] = analysis
        
        // Generate insights
        var insights: [String] = []
        
        if totalCardsFound == 0 {
            insights.append("🚨 NO CARDS FOUND - User has no cards in their Leitner system")
        } else {
            insights.append("✅ Found ".concat(totalCardsFound.toString()).concat(" cards in user's Leitner system"))
        }
        
        if currentDayCards.length == 0 {
            if futureQueueExpected > 0 {
                insights.append("📅 Current day empty but ".concat(futureQueueExpected.toString()).concat(" cards in future queue - use complete_leitner_day to rotate"))
            } else if archivedExpected == totalCardsFound {
                insights.append("🎯 All cards are archived (mastered)")
            } else {
                insights.append("❓ No current day cards but cards exist - queue may be corrupted")
            }
        }
        
        if missingFromCurrentDay.length > 0 {
            insights.append("⚠️  " + missingFromCurrentDay.length.toString() + " level 1 cards are missing from current day")
        }
        
        if cardLevelDistribution.keys.length > 0 {
            var levelSummary = "📊 Level distribution: "
            for level in cardLevelDistribution.keys {
                let count = cardLevelDistribution[level]!
                levelSummary = levelSummary.concat("L").concat(level.toString()).concat(":").concat(count.toString()).concat(" ")
            }
            insights.append(levelSummary)
        }
        
        debugData["insights"] = insights
        
        return debugData
    }
    
    return nil
} 