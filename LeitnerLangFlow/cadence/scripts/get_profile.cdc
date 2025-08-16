import "LeitnerLang"

/// Gets comprehensive user profile information including learning statistics
/// Returns nil if user doesn't have a profile setup
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
        // Profile not setup or capability not published
        return nil
    }
    
    // Borrow the profile reference
    if let profileRef = profileCap.borrow() {
        // Get basic profile stats
        let stats = profileRef.getStats()
        
        // Add additional computed information
        var profileData: {String: AnyStruct} = {}
        
        // Copy basic stats
        profileData["totalCards"] = stats["totalCards"]
        profileData["totalReviews"] = stats["totalReviews"]
        profileData["streakDays"] = stats["streakDays"]
        profileData["primaryLanguage"] = stats["primaryLanguage"]
        profileData["createdAt"] = stats["createdAt"]
        
        // Add account information
        profileData["userAddress"] = userAddress.toString()
        
        // Calculate additional metrics
        let totalCards = stats["totalCards"] as! Int? ?? 0
        let totalReviews = stats["totalReviews"] as! UInt32? ?? 0
        
        // Calculate average reviews per card (avoid division by zero)
        if totalCards > 0 {
            let reviewsPerCard = UFix64(totalReviews) / UFix64(totalCards)
            profileData["averageReviewsPerCard"] = reviewsPerCard
        } else {
            profileData["averageReviewsPerCard"] = 0.0
        }
        
        // Get cards due for review count
        let cardsDue = LeitnerLang.getCardsDueForReview(userAddress: userAddress)
        profileData["cardsDueForReview"] = cardsDue.length
        profileData["cardsDueIds"] = cardsDue
        
        // Calculate learning efficiency (correct reviews / total reviews)
        if totalReviews > 0 {
            // Note: We would need to track correct reviews in the contract to calculate this
            // For now, we'll indicate this metric needs additional tracking
            profileData["learningEfficiencyNote"] = "Requires correct review tracking in contract"
        }
        
        // Add profile status
        profileData["hasActiveProfile"] = true
        profileData["profileStatus"] = totalCards > 0 ? "Active" : "Setup Complete"
        
        return profileData
    }
    
    // If we reach here, something went wrong with borrowing
    return nil
}
