import "LeitnerLang"

transaction(primaryLanguage: String) {
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if profile already exists
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) != nil {
            panic("Profile already exists for this account")
        }
        
        // Validate primary language input
        if primaryLanguage.length == 0 {
            panic("Primary language cannot be empty")
        }
        
        // Setup the profile using the contract function
        LeitnerLang.setupProfile(account: signer, primaryLanguage: primaryLanguage)
    }
    
    execute {
        log("Profile setup completed successfully for primary language: ".concat(primaryLanguage))
    }
    

}
