import "LeitnerLang"

/// Simple test script to verify contract deployment and basic functionality
access(all) fun main(): String {
    // Test basic contract access
    let profileStoragePath = LeitnerLang.getProfileStoragePath()
    let deckStoragePath = LeitnerLang.getDeckStoragePath()
    
    // Return confirmation that contract is accessible
    return "LeitnerLang contract is deployed and accessible! Profile path: ".concat(profileStoragePath.toString()).concat(", Deck path: ").concat(deckStoragePath.toString())
} 