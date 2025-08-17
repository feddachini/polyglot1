import LeitnerLang from 0x17c88b3a4fab12ef

/// Gets all existing deck IDs with basic information
/// Returns an array of deck summaries
access(all) fun main(): [{String: AnyStruct}] {
    var deckSummaries: [{String: AnyStruct}] = []
    
    // Get the current max deck ID (nextDeckId - 1)
    let maxDeckId = LeitnerLang.nextDeckId - 1
    
    // Iterate through all possible deck IDs starting from 1
    var deckId: UInt64 = 1
    while deckId <= maxDeckId {
        // Try to get deck information
        if let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId) {
            var summary: {String: AnyStruct} = {}
            
            summary["id"] = deckId
            summary["concept"] = deckInfo["concept"]
            summary["meaning"] = deckInfo["meaning"]
            summary["creator"] = deckInfo["creator"]
            summary["createdAt"] = deckInfo["createdAt"]
            
            // Calculate age
            let createdAt = deckInfo["createdAt"] as! UFix64? ?? 0.0
            let currentTime = getCurrentBlock().timestamp
            let daysSinceCreation = (currentTime - createdAt) / 86400.0
            summary["daysSinceCreation"] = daysSinceCreation
            
            // Add concept display
            let concept = deckInfo["concept"] as! String? ?? ""
            let meaning = deckInfo["meaning"] as! String? ?? ""
            summary["displayText"] = concept.concat(": ").concat(meaning)
            
            deckSummaries.append(summary)
        }
        
        deckId = deckId + 1
    }
    
    return deckSummaries
} 