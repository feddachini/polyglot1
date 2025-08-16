access(all)
contract LeitnerLang {
    
    // Events
    access(all) event DeckCreated(id: UInt64, concept: String, creator: Address)
    access(all) event CardCreated(id: UInt64, deckId: UInt64, front: String, back: String)
    access(all) event ProfileSetup(owner: Address, primaryLanguage: String)
    access(all) event CardReviewed(cardId: UInt64, userAddress: Address, newLevel: UInt8, correct: Bool)
    access(all) event LeitnerDayCompleted(userAddress: Address, cardsReviewed: UInt32)
    
    // Storage paths
    access(all) let ProfileStoragePath: StoragePath
    access(all) let ProfilePublicPath: PublicPath
    access(all) let DeckStoragePath: StoragePath
    access(all) let DeckPublicPath: PublicPath
    
    // Global counters
    access(all) var nextDeckId: UInt64
    access(all) var nextCardId: UInt64
    
    // Phrase struct to represent text with phonetics and language
    access(all) struct Phrase {
        access(all) let text: String
        access(all) let phonetic: String?
        access(all) let language: String
        
        init(text: String, phonetic: String?, language: String) {
            self.text = text
            self.phonetic = phonetic
            self.language = language
        }
    }
    
    // LeitnerCard struct to track spaced repetition data (simplified - no dates)
    access(all) struct LeitnerCard {
        access(all) let cardId: UInt64
        access(all) var level: UInt8              // 0=archived, 1-7=active levels
        access(all) var reviewCount: UInt32
        access(all) var correctCount: UInt32
        
        init(cardId: UInt64) {
            self.cardId = cardId
            self.level = 1                        // Start at level 1
            self.reviewCount = 0
            self.correctCount = 0
        }
        
        access(all) fun updateAfterReview(correct: Bool): UInt8 {
            self.reviewCount = self.reviewCount + 1
            
            if correct {
                self.correctCount = self.correctCount + 1
                // Level progression: 1->2->3->4->5->6->7->0 (archived)
                if self.level == 7 {
                    self.level = 0                // Archive at level 0
                } else {
                    self.level = self.level + 1
                }
            } else {
                // Reset to level 1 on incorrect answer
                self.level = 1
            }
            
            return self.level
        }
    }
    
    // Card resource representing a flashcard
    access(all) resource Card {
        access(all) let id: UInt64
        access(all) let front: Phrase
        access(all) let back: Phrase
        access(all) let deckId: UInt64
        access(all) let createdAt: UFix64
        
        init(id: UInt64, front: Phrase, back: Phrase, deckId: UInt64) {
            self.id = id
            self.front = front
            self.back = back
            self.deckId = deckId
            self.createdAt = getCurrentBlock().timestamp
        }
    }
    
    // Simplified Deck resource - just concept and meaning
    access(all) resource Deck {
        access(all) let id: UInt64
        access(all) let concept: String           // "greetings", "numbers", etc.
        access(all) let meaning: String           // "Basic greeting words"
        access(all) let createdAt: UFix64
        access(all) let creator: Address
        
        init(id: UInt64, concept: String, meaning: String, creator: Address) {
            self.id = id
            self.concept = concept
            self.meaning = meaning
            self.createdAt = getCurrentBlock().timestamp
            self.creator = creator
        }
    }
    
    // Profile resource with queue-based Leitner system
    access(all) resource Profile {
        access(all) var primaryLanguage: String
        access(all) var leitnerCards: {UInt64: LeitnerCard}
        access(all) var totalReviews: UInt32
        access(all) var streakDays: UInt32
        access(all) var lastReviewDate: UFix64?
        access(all) let createdAt: UFix64
        
        // NEW: 32-day circular queue system
        access(all) var leitnerQueue: [[UInt64]]  // 32 arrays of card IDs
        
        init(primaryLanguage: String) {
            self.primaryLanguage = primaryLanguage
            self.leitnerCards = {}
            self.totalReviews = 0
            self.streakDays = 0
            self.lastReviewDate = nil
            self.createdAt = getCurrentBlock().timestamp
            
            // Initialize 32 empty arrays for queue
            self.leitnerQueue = []
            var i = 0
            while i < 32 {
                self.leitnerQueue.append([])
                i = i + 1
            }
        }
        
        // Get current day's cards (always leitnerQueue[0])
        access(all) fun getCurrentDayCards(): [UInt64] {
            return self.leitnerQueue[0]
        }
        
        // Check if current leitner day is complete
        access(all) fun isLeitnerDayComplete(): Bool {
            return self.leitnerQueue[0].length == 0
        }
        
        // Complete leitner day and rotate queue
        access(all) fun completeLeitnerDay() {
            if self.isLeitnerDayComplete() {
                // Move empty array from front to back
                let emptyArray = self.leitnerQueue.removeFirst()
                self.leitnerQueue.append(emptyArray)
                
                // Update streak and date tracking
                let today = getCurrentBlock().timestamp
                if let lastReview = self.lastReviewDate {
                    let daysDiff = (today - lastReview) / 86400.0
                    if daysDiff <= 1.5 {
                        self.streakDays = self.streakDays + 1
                    } else {
                        self.streakDays = 1
                    }
                } else {
                    self.streakDays = 1
                }
                self.lastReviewDate = today
                
                emit LeitnerDayCompleted(userAddress: self.owner?.address ?? panic("Profile has no owner"), cardsReviewed: self.totalReviews)
            }
        }
        
        // Force complete leitner day (even with remaining cards)
        access(all) fun forceCompleteLeitnerDay() {
            // Move any remaining cards to position 1 (tomorrow after rotation)
            let remainingCards = self.leitnerQueue[0]
            
            // Clear current day
            self.leitnerQueue[0] = []
            
            // Add remaining cards to tomorrow (position 1)
            for cardId in remainingCards {
                self.leitnerQueue[1].append(cardId)
            }
            
            // Now complete the day (rotate queue)
            let emptyArray = self.leitnerQueue.removeFirst()
            self.leitnerQueue.append(emptyArray)
            
            // Update streak and date tracking
            let today = getCurrentBlock().timestamp
            if let lastReview = self.lastReviewDate {
                let daysDiff = (today - lastReview) / 86400.0
                if daysDiff <= 1.5 {
                    self.streakDays = self.streakDays + 1
                } else {
                    self.streakDays = 1
                }
            } else {
                self.streakDays = 1
            }
            self.lastReviewDate = today
            
            emit LeitnerDayCompleted(userAddress: self.owner?.address ?? panic("Profile has no owner"), cardsReviewed: self.totalReviews)
        }
        
        // Add card to Leitner system (place in queue[0] for immediate review)
        access(all) fun addCardToLeitner(cardId: UInt64) {
            if self.leitnerCards[cardId] == nil {
                self.leitnerCards[cardId] = LeitnerCard(cardId: cardId)
                // Add to current day for first review
                self.leitnerQueue[0].append(cardId)
            }
        }
        
        // Remove card from current day queue
        access(all) fun removeCardFromCurrentDay(cardId: UInt64) {
            var newCurrentDay: [UInt64] = []
            for id in self.leitnerQueue[0] {
                if id != cardId {
                    newCurrentDay.append(id)
                }
            }
            self.leitnerQueue[0] = newCurrentDay
        }
        
        // Place card in queue based on level
        access(all) fun placeCardInQueue(cardId: UInt64, level: UInt8) {
            if level == 0 {
                // Level 0 (archived) - don't re-queue
                return
            }
            
            // Intervals: [1,2,4,8,16,32] days for levels [1,2,3,4,5,6]
            let intervals = [1, 2, 4, 8, 16, 32]
            let daysAhead = intervals[level - 1]
            let targetIndex = daysAhead % 32
            
            self.leitnerQueue[targetIndex].append(cardId)
        }
        
        // Review card with queue logic
        access(all) fun reviewCard(cardId: UInt64, correct: Bool) {
            pre {
                self.leitnerCards[cardId] != nil: "Card not found in user's Leitner system"
            }
            
            // Remove from current day
            self.removeCardFromCurrentDay(cardId: cardId)
            
            // Update card level
            let leitnerCard = &self.leitnerCards[cardId]! as &LeitnerCard
            let newLevel = leitnerCard.updateAfterReview(correct: correct)
            
            // Place back in queue unless archived (level 0)
            self.placeCardInQueue(cardId: cardId, level: newLevel)
            
            self.totalReviews = self.totalReviews + 1
        }
        
        access(all) fun getCardLevel(cardId: UInt64): UInt8? {
            return self.leitnerCards[cardId]?.level
        }
        
        // Get cards due for review (always current day)
        access(all) fun getCardsDueForReview(): [UInt64] {
            return self.getCurrentDayCards()
        }
        
        access(all) fun getStats(): {String: AnyStruct} {
            return {
                "totalCards": self.leitnerCards.length,
                "totalReviews": self.totalReviews,
                "streakDays": self.streakDays,
                "primaryLanguage": self.primaryLanguage,
                "createdAt": self.createdAt,
                "currentDayCards": self.getCurrentDayCards().length,
                "isLeitnerDayComplete": self.isLeitnerDayComplete()
            }
        }
    }
    
    // Public interfaces
    access(all) resource interface ProfilePublic {
        access(all) fun getStats(): {String: AnyStruct}
        access(all) fun getCardLevel(cardId: UInt64): UInt8?
        access(all) fun getCardsDueForReview(): [UInt64]
    }
    
    access(all) resource interface DeckPublic {
        access(all) let id: UInt64
        access(all) let concept: String
        access(all) let meaning: String
    }
    
    // Admin resource for managing decks and cards
    access(all) resource Admin {
        access(all) fun createDeck(concept: String, meaning: String, creator: Address): @Deck {
            let deck <- create Deck(
                id: LeitnerLang.nextDeckId,
                concept: concept,
                meaning: meaning,
                creator: creator
            )
            
            emit DeckCreated(id: LeitnerLang.nextDeckId, concept: concept, creator: creator)
            LeitnerLang.nextDeckId = LeitnerLang.nextDeckId + 1
            
            return <-deck
        }
        
        access(all) fun createCard(front: Phrase, back: Phrase, deckId: UInt64): @Card {
            let card <- create Card(
                id: LeitnerLang.nextCardId,
                front: front,
                back: back,
                deckId: deckId
            )
            
            emit CardCreated(id: LeitnerLang.nextCardId, deckId: deckId, front: front.text, back: back.text)
            LeitnerLang.nextCardId = LeitnerLang.nextCardId + 1
            
            return <-card
        }
    }
    
    // Public functions
    access(all) fun createProfile(primaryLanguage: String): @Profile {
        return <-create Profile(primaryLanguage: primaryLanguage)
    }
    
    // Simplified deck creation
    access(all) fun createDeck(concept: String, meaning: String, adminRef: &Admin): UInt64 {
        let deck <- adminRef.createDeck(concept: concept, meaning: meaning, creator: self.account.address)
        let deckId = deck.id
        
        // Store deck with unique path
        let deckPath = StoragePath(identifier: "LeitnerLangDeck_".concat(deckId.toString()))!
        self.account.storage.save(<-deck, to: deckPath)
        
        return deckId
    }
    
    // Card creation (unchanged)
    access(all) fun createCard(
        frontText: String,
        frontPhonetic: String?,
        frontLanguage: String,
        backText: String,
        backPhonetic: String?,
        backLanguage: String,
        deckId: UInt64,
        adminRef: &Admin
    ): UInt64 {
        let frontPhrase = Phrase(text: frontText, phonetic: frontPhonetic, language: frontLanguage)
        let backPhrase = Phrase(text: backText, phonetic: backPhonetic, language: backLanguage)
        
        let card <- adminRef.createCard(front: frontPhrase, back: backPhrase, deckId: deckId)
        let cardId = card.id
        
        // Get the deck and add the card
        let deckPath = StoragePath(identifier: "LeitnerLangDeck_".concat(deckId.toString()))!
        if let deckRef = self.account.storage.borrow<&Deck>(from: deckPath) {
            // For now, just store card separately since deck doesn't track cards
            let cardPath = StoragePath(identifier: "LeitnerLangCard_".concat(cardId.toString()))!
            self.account.storage.save(<-card, to: cardPath)
        } else {
            panic("Deck not found")
        }
        
        return cardId
    }
    
    // Profile setup with queue initialization
    access(all) fun setupProfile(account: auth(Storage, Capabilities) &Account, primaryLanguage: String) {
        pre {
            account.storage.borrow<&Profile>(from: self.ProfileStoragePath) == nil: "Profile already exists"
        }
        
        let profile <- self.createProfile(primaryLanguage: primaryLanguage)
        account.storage.save(<-profile, to: self.ProfileStoragePath)
        
        account.capabilities.unpublish(self.ProfilePublicPath)
        let profileCap = account.capabilities.storage.issue<&Profile>(self.ProfileStoragePath)
        account.capabilities.publish(profileCap, at: self.ProfilePublicPath)
        
        emit ProfileSetup(owner: account.address, primaryLanguage: primaryLanguage)
    }
    
    // Review card with queue system
    access(all) fun reviewCard(account: auth(Storage) &Account, cardId: UInt64, correct: Bool) {
        pre {
            account.storage.borrow<&Profile>(from: self.ProfileStoragePath) != nil: "Profile not found"
        }
        
        let profileRef = account.storage.borrow<&Profile>(from: self.ProfileStoragePath)!
        
        // Add card to Leitner system if not already there
        profileRef.addCardToLeitner(cardId: cardId)
        
        // Review the card (uses queue logic)
        profileRef.reviewCard(cardId: cardId, correct: correct)
        
        let newLevel = profileRef.getCardLevel(cardId: cardId) ?? 0
        emit CardReviewed(cardId: cardId, userAddress: account.address, newLevel: newLevel, correct: correct)
        
        // Note: Leitner day completion is now manual only
        // Users must explicitly call complete_leitner_day transaction
    }
    
    // Force complete Leitner day (manual completion)
    access(all) fun forceCompleteLeitnerDay(account: auth(Storage) &Account) {
        pre {
            account.storage.borrow<&Profile>(from: self.ProfileStoragePath) != nil: "Profile not found"
        }
        
        let profileRef = account.storage.borrow<&Profile>(from: self.ProfileStoragePath)!
        profileRef.forceCompleteLeitnerDay()
    }
    
    // Get card level
    access(all) fun getCardLevel(userAddress: Address, cardId: UInt64): UInt8? {
        let account = getAccount(userAddress)
        let profileCap = account.capabilities.get<&Profile>(self.ProfilePublicPath)
        
        if let profileRef = profileCap.borrow() {
            return profileRef.getCardLevel(cardId: cardId)
        }
        return nil
    }
    
    // Get cards due for review (queue-based)
    access(all) fun getCardsDueForReview(userAddress: Address): [UInt64] {
        let account = getAccount(userAddress)
        let profileCap = account.capabilities.get<&Profile>(self.ProfilePublicPath)
        
        if let profileRef = profileCap.borrow() {
            return profileRef.getCardsDueForReview()
        }
        return []
    }
    
    // Get user stats
    access(all) fun getUserStats(userAddress: Address): {String: AnyStruct}? {
        let account = getAccount(userAddress)
        let profileCap = account.capabilities.get<&Profile>(self.ProfilePublicPath)
        
        if let profileRef = profileCap.borrow() {
            return profileRef.getStats()
        }
        return nil
    }
    
    // Get deck info (simplified)
    access(all) fun getDeckInfo(deckId: UInt64): {String: AnyStruct}? {
        let deckPath = StoragePath(identifier: "LeitnerLangDeck_".concat(deckId.toString()))!
        
        if let deckRef = self.account.storage.borrow<&Deck>(from: deckPath) {
            return {
                "id": deckRef.id,
                "concept": deckRef.concept,
                "meaning": deckRef.meaning,
                "createdAt": deckRef.createdAt,
                "creator": deckRef.creator
            }
        }
        return nil
    }
    
    // Get card info
    access(all) fun getCardInfo(cardId: UInt64): {String: AnyStruct}? {
        let cardPath = StoragePath(identifier: "LeitnerLangCard_".concat(cardId.toString()))!
        
        if let cardRef = self.account.storage.borrow<&Card>(from: cardPath) {
            return {
                "id": cardRef.id,
                "frontText": cardRef.front.text,
                "frontPhonetic": cardRef.front.phonetic,
                "frontLanguage": cardRef.front.language,
                "backText": cardRef.back.text,
                "backPhonetic": cardRef.back.phonetic,
                "backLanguage": cardRef.back.language,
                "deckId": cardRef.deckId,
                "createdAt": cardRef.createdAt
            }
        }
        return nil
    }
    
    access(all) fun getProfileStoragePath(): StoragePath {
        return self.ProfileStoragePath
    }
    
    access(all) fun getProfilePublicPath(): PublicPath {
        return self.ProfilePublicPath
    }
    
    access(all) fun getDeckStoragePath(): StoragePath {
        return self.DeckStoragePath
    }
    
    access(all) fun getDeckPublicPath(): PublicPath {
        return self.DeckPublicPath
    }
    
    init() {
        self.ProfileStoragePath = /storage/LeitnerLangProfile
        self.ProfilePublicPath = /public/LeitnerLangProfile
        self.DeckStoragePath = /storage/LeitnerLangDecks
        self.DeckPublicPath = /public/LeitnerLangDecks
        
        self.nextDeckId = 1
        self.nextCardId = 1
        
        let admin <- create Admin()
        self.account.storage.save(<-admin, to: /storage/LeitnerLangAdmin)
        
        emit ProfileSetup(owner: self.account.address, primaryLanguage: "system")
    }
}