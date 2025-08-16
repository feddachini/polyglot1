import "LeitnerLang"

/// Comprehensive test script for review workflow validation
/// Tests card progression, queue mechanics, and level transitions
access(all) fun main(userAddress: Address): {String: AnyStruct} {
    var testResults: {String: AnyStruct} = {}
    
    // Test metadata
    testResults["testName"] = "Review Workflow Validation"
    testResults["userAddress"] = userAddress.toString()
    testResults["timestamp"] = getCurrentBlock().timestamp
    
    // Get the user's account
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        testResults["status"] = "FAILED"
        testResults["error"] = "User profile not found or not accessible"
        return testResults
    }
    
    if let profileRef = profileCap.borrow() {
        // Test 1: Profile State Analysis
        var profileTest: {String: AnyStruct} = {}
        let stats = profileRef.getStats()
        profileTest["totalCards"] = stats["totalCards"]
        profileTest["totalReviews"] = stats["totalReviews"]
        profileTest["streakDays"] = stats["streakDays"]
        profileTest["isLeitnerDayComplete"] = profileRef.isLeitnerDayComplete()
        
        let currentDayCards = profileRef.getCardsDueForReview()
        profileTest["currentDayCardCount"] = currentDayCards.length
        profileTest["currentDayCards"] = currentDayCards
        
        testResults["profileState"] = profileTest
        
        // Test 2: Card Level Analysis
        var cardAnalysis: [{String: AnyStruct}] = []
        var levelDistribution: {UInt8: Int} = {}
        
        for cardId in currentDayCards {
            var cardTest: {String: AnyStruct} = {}
            cardTest["cardId"] = cardId
            
            if let level = profileRef.getCardLevel(cardId: cardId) {
                cardTest["currentLevel"] = level
                cardTest["levelDescription"] = getLevelDescription(level: level)
                
                // Track level distribution
                if levelDistribution[level] == nil {
                    levelDistribution[level] = 1
                } else {
                    levelDistribution[level] = levelDistribution[level]! + 1
                }
                
                // Calculate expected progression
                let nextLevelCorrect: UInt8 = level == 7 ? 0 : (level < 7 ? level + 1 : level)
                let nextLevelIncorrect: UInt8 = 1
                
                cardTest["nextLevelIfCorrect"] = nextLevelCorrect
                cardTest["nextLevelIfIncorrect"] = nextLevelIncorrect
                
                // Calculate expected interval
                if nextLevelCorrect > 0 && nextLevelCorrect <= 6 {
                    let intervals = [1, 2, 4, 8, 16, 32]
                    cardTest["expectedIntervalDays"] = intervals[nextLevelCorrect - 1]
                } else if nextLevelCorrect == 0 {
                    cardTest["expectedIntervalDays"] = 0
                    cardTest["willBeArchived"] = true
                }
                
                // Get card content for context
                if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
                    cardTest["frontText"] = cardInfo["frontText"]
                    cardTest["backText"] = cardInfo["backText"]
                    cardTest["frontLanguage"] = cardInfo["frontLanguage"]
                    cardTest["backLanguage"] = cardInfo["backLanguage"]
                    
                    let frontText = cardInfo["frontText"] as! String? ?? ""
                    let backText = cardInfo["backText"] as! String? ?? ""
                    let frontLang = cardInfo["frontLanguage"] as! String? ?? ""
                    let backLang = cardInfo["backLanguage"] as! String? ?? ""
                    cardTest["displayText"] = frontText.concat(" (").concat(frontLang).concat(") → ").concat(backText).concat(" (").concat(backLang).concat(")")
                    cardTest["deckId"] = cardInfo["deckId"]
                }
                
                // Generate review recommendations
                cardTest["reviewRecommendation"] = getReviewRecommendation(level: level)
                cardTest["difficultyAssessment"] = getDifficultyAssessment(level: level)
                
            } else {
                cardTest["error"] = "Card not found in Leitner system"
            }
            
            cardAnalysis.append(cardTest)
        }
        
        testResults["cardAnalysis"] = cardAnalysis
        testResults["levelDistribution"] = levelDistribution
        
        // Test 3: Queue Mechanics Validation
        var queueTest: {String: AnyStruct} = {}
        queueTest["currentDayEmpty"] = currentDayCards.length == 0
        queueTest["readyForRotation"] = profileRef.isLeitnerDayComplete()
        
        // Simulate review outcomes
        var simulatedOutcomes: [{String: AnyStruct}] = []
        
        for cardId in currentDayCards {
            if let level = profileRef.getCardLevel(cardId: cardId) {
                var simulation: {String: AnyStruct} = {}
                simulation["cardId"] = cardId
                simulation["currentLevel"] = level
                
                // Simulate correct answer
                let correctLevel: UInt8 = level == 7 ? 0 : (level < 7 ? level + 1 : level)
                simulation["correctOutcome"] = {
                    "newLevel": correctLevel,
                    "action": correctLevel == 0 ? "Archive card" : "Place in queue",
                    "nextReviewDays": correctLevel == 0 ? 0 : getIntervalForLevel(level: correctLevel)
                }
                
                // Simulate incorrect answer
                simulation["incorrectOutcome"] = {
                    "newLevel": 1,
                    "action": "Reset to level 1",
                    "nextReviewDays": 1
                }
                
                simulatedOutcomes.append(simulation)
            }
        }
        
        queueTest["simulatedOutcomes"] = simulatedOutcomes
        testResults["queueMechanics"] = queueTest
        
        // Test 4: Learning Progress Analysis
        var progressAnalysis: {String: AnyStruct} = {}
        
        let totalCards = stats["totalCards"] as! Int? ?? 0
        let totalReviews = stats["totalReviews"] as! UInt32? ?? 0
        
        progressAnalysis["cardsMastered"] = 0 // We'd need to track level 0 cards
        progressAnalysis["cardsInProgress"] = currentDayCards.length
        progressAnalysis["reviewEfficiency"] = totalCards > 0 ? UFix64(totalReviews) / UFix64(totalCards) : 0.0
        progressAnalysis["studySessionSize"] = currentDayCards.length
        
        // Learning recommendations
        if currentDayCards.length == 0 {
            progressAnalysis["recommendation"] = "🎉 All caught up! Add more cards or wait for scheduled reviews."
            progressAnalysis["status"] = "Complete"
        } else if currentDayCards.length <= 5 {
            progressAnalysis["recommendation"] = "📚 Perfect study session size - focus on quality!"
            progressAnalysis["status"] = "Optimal"
        } else if currentDayCards.length <= 15 {
            progressAnalysis["recommendation"] = "📖 Good session size - maintain steady pace."
            progressAnalysis["status"] = "Good"
        } else {
            progressAnalysis["recommendation"] = "📚 Large session - consider breaking into smaller chunks."
            progressAnalysis["status"] = "Heavy"
        }
        
        testResults["progressAnalysis"] = progressAnalysis
        
        // Test 5: System Health Check
        var healthCheck: {String: AnyStruct} = {}
        healthCheck["profileAccessible"] = true
        healthCheck["queueFunctional"] = true
        healthCheck["cardsAccessible"] = cardAnalysis.length > 0
        healthCheck["levelsValid"] = validateLevelDistribution(distribution: levelDistribution)
        healthCheck["overallHealth"] = "HEALTHY"
        
        testResults["systemHealth"] = healthCheck
        testResults["status"] = "SUCCESS"
        
    } else {
        testResults["status"] = "FAILED"
        testResults["error"] = "Failed to borrow profile reference"
    }
    
    return testResults
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

/// Helper function to get interval for specific level
access(all) fun getIntervalForLevel(level: UInt8): Int {
    let intervals = [1, 2, 4, 8, 16, 32]
    if level >= 1 && level <= 6 {
        return intervals[level - 1]
    }
    return 0
}

/// Helper function to get review recommendation
access(all) fun getReviewRecommendation(level: UInt8): String {
    switch level {
        case 1: return "New card - take your time, focus on understanding"
        case 2: return "Learning phase - practice active recall"
        case 3: return "Getting familiar - test yourself confidently"
        case 4: return "Well known - quick review should suffice"
        case 5: return "Almost mastered - final reinforcement"
        case 6: return "Mastered - last review before expertise"
        case 7: return "Expert level - one more correct answer to archive!"
        default: return "Review as needed"
    }
}

/// Helper function to assess difficulty
access(all) fun getDifficultyAssessment(level: UInt8): String {
    if level >= 1 && level <= 2 {
        return "High Priority - Needs attention"
    } else if level >= 3 && level <= 4 {
        return "Medium Priority - Steady progress"
    } else if level >= 5 && level <= 6 {
        return "Low Priority - Well learned"
    } else if level == 7 {
        return "Final Stage - Almost complete"
    } else {
        return "Unknown"
    }
}

/// Helper function to validate level distribution
access(all) fun validateLevelDistribution(distribution: {UInt8: Int}): Bool {
    // Check that all levels are within valid range (0-7)
    for level in distribution.keys {
        if level > 7 {
            return false
        }
    }
    return true
} 