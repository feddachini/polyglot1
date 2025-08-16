import "LeitnerLang"

transaction(
    frontText: String,
    frontPhonetic: String?,
    frontLanguage: String,
    backText: String,
    backPhonetic: String?,
    backLanguage: String,
    deckId: UInt64
) {
    
    let adminRef: &LeitnerLang.Admin
    
    prepare(signer: auth(Storage) &Account) {
        // Get admin capability from signer's account
        self.adminRef = signer.storage.borrow<&LeitnerLang.Admin>(from: /storage/LeitnerLangAdmin)
            ?? panic("Signer does not have admin access")
        
        // Validate input parameters
        if frontText.length == 0 {
            panic("Front text cannot be empty")
        }
        
        if backText.length == 0 {
            panic("Back text cannot be empty")
        }
        
        if frontLanguage.length == 0 {
            panic("Front language cannot be empty")
        }
        
        if backLanguage.length == 0 {
            panic("Back language cannot be empty")
        }
        
        // Verify deck exists
        let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
        if deckInfo == nil {
            panic("Deck with ID ".concat(deckId.toString()).concat(" does not exist"))
        }
    }
    
    execute {
        // Create the card using admin reference
        let cardId = LeitnerLang.createCard(
            frontText: frontText,
            frontPhonetic: frontPhonetic,
            frontLanguage: frontLanguage,
            backText: backText,
            backPhonetic: backPhonetic,
            backLanguage: backLanguage,
            deckId: deckId,
            adminRef: self.adminRef
        )
        
        log("Card created successfully with ID: ".concat(cardId.toString()))
        log("Front: ".concat(frontText).concat(" (").concat(frontLanguage).concat(")"))
        log("Back: ".concat(backText).concat(" (").concat(backLanguage).concat(")"))
        log("Added to deck ID: ".concat(deckId.toString()))
        
        if let frontPhoneticValue = frontPhonetic {
            log("Front phonetic: ".concat(frontPhoneticValue))
        }
        
        if let backPhoneticValue = backPhonetic {
            log("Back phonetic: ".concat(backPhoneticValue))
        }
    }
}
