import "LeitnerLang"

transaction(concept: String, meaning: String) {
    
    let adminRef: &LeitnerLang.Admin
    
    prepare(signer: auth(Storage) &Account) {
        // Get admin capability from signer's account
        self.adminRef = signer.storage.borrow<&LeitnerLang.Admin>(from: /storage/LeitnerLangAdmin)
            ?? panic("Signer does not have admin access")
        
        // Validate input parameters
        if concept.length == 0 {
            panic("Deck concept cannot be empty")
        }
        
        if meaning.length == 0 {
            panic("Deck meaning cannot be empty")
        }
    }
    
    execute {
        // Create the deck using admin reference
        let deckId = LeitnerLang.createDeck(
            concept: concept,
            meaning: meaning,
            adminRef: self.adminRef
        )
        
        log("Deck created successfully with ID: ".concat(deckId.toString()))
        log("Concept: ".concat(concept))
        log("Meaning: ".concat(meaning))
    }
}
