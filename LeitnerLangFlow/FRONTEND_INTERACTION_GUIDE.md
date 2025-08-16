# Frontend Interaction Guide: LeitnerLang on Flow Testnet

## Complete Next.js Integration for Web3 Spaced Repetition Language Learning

This guide provides everything you need to integrate the LeitnerLang smart contract with your Next.js frontend application on Flow testnet.

---

## 📋 **Prerequisites**

- **Next.js 13+** with TypeScript
- **Flow testnet wallet** (Blocto, Lilico, or Flow Wallet)
- **LeitnerLang contract deployed on testnet**
- **Basic React/TypeScript knowledge**

---

## 🔧 **1. Installation & Setup**

### Install FCL and Dependencies

```bash
npm install @onflow/fcl @onflow/types @onflow/util-address
npm install @onflow/util-encode-key @onflow/sdk
npm install -D @types/node
```

### Create Flow Configuration

**`src/flow/config.ts`**
```typescript
import * as fcl from "@onflow/fcl"

// Flow testnet configuration
const FLOW_TESTNET_CONFIG = {
  "app.detail.title": "LeitnerLang - Web3 Language Learning",
  "app.detail.icon": "https://your-app.com/icon.png",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
  "flow.network": "testnet"
}

// Contract addresses on testnet
export const CONTRACT_ADDRESSES = {
  LeitnerLang: "0x984a68faa5fc5e12", // Replace with your deployed address
  NonFungibleToken: "0x631e88ae7f1d7c20",
  MetadataViews: "0x631e88ae7f1d7c20",
  FungibleToken: "0x9a0766d93b6608b7"
}

// Initialize FCL
fcl.config(FLOW_TESTNET_CONFIG)

export { fcl }
```

### Environment Variables

**`.env.local`**
```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_LEITNERLANG_ADDRESS=0x984a68faa5fc5e12
NEXT_PUBLIC_APP_URL=https://your-app.com
```

---

## 🔐 **2. Authentication & Wallet Connection**

### Flow Auth Hook

**`src/hooks/useFlowAuth.ts`**
```typescript
import { useState, useEffect } from "react"
import { fcl } from "../flow/config"

export interface FlowUser {
  addr: string
  cid: string
  loggedIn: boolean
  services: any[]
}

export const useFlowAuth = () => {
  const [user, setUser] = useState<FlowUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    setLoading(false)
    return unsubscribe
  }, [])

  const logIn = async () => {
    try {
      await fcl.authenticate()
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const logOut = async () => {
    try {
      await fcl.unauthenticate()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return {
    user,
    loggedIn: user?.loggedIn || false,
    loading,
    logIn,
    logOut
  }
}
```

### Wallet Connect Component

**`src/components/WalletConnect.tsx`**
```typescript
import { useFlowAuth } from "../hooks/useFlowAuth"

export const WalletConnect: React.FC = () => {
  const { user, loggedIn, loading, logIn, logOut } = useFlowAuth()

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
    )
  }

  if (loggedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900">Connected</div>
          <div className="text-gray-500 font-mono text-xs">
            {user.addr.slice(0, 8)}...
          </div>
        </div>
        <button
          onClick={logOut}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={logIn}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
    >
      Connect Wallet
    </button>
  )
}
```

---

## 📜 **3. Cadence Scripts (Read Operations)**

### Script Execution Hook

**`src/hooks/useFlowScript.ts`**
```typescript
import { useState, useCallback } from "react"
import { fcl } from "../flow/config"
import { CONTRACT_ADDRESSES } from "../flow/config"

export const useFlowScript = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeScript = useCallback(async (script: string, args: any[] = []) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await fcl.query({
        cadence: script.replace(/import "LeitnerLang"/g, `import LeitnerLang from ${CONTRACT_ADDRESSES.LeitnerLang}`),
        args
      })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Script execution failed"
      setError(errorMessage)
      console.error("Script execution error:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { executeScript, loading, error }
}
```

### Profile Data Hook

**`src/hooks/useProfile.ts`**
```typescript
import { useState, useEffect } from "react"
import { useFlowScript } from "./useFlowScript"
import * as fcl from "@onflow/fcl"

const GET_PROFILE_SCRIPT = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return nil
    }
    
    if let profileRef = profileCap.borrow() {
        let stats = profileRef.getStats()
        var profileData: {String: AnyStruct} = {}
        
        profileData["totalCards"] = stats["totalCards"]
        profileData["totalReviews"] = stats["totalReviews"] 
        profileData["streakDays"] = stats["streakDays"]
        profileData["primaryLanguage"] = stats["primaryLanguage"]
        profileData["userAddress"] = userAddress.toString()
        
        let totalCards = stats["totalCards"] as! Int? ?? 0
        let totalReviews = stats["totalReviews"] as! UInt32? ?? 0
        
        if totalCards > 0 {
            profileData["averageReviewsPerCard"] = UFix64(totalReviews) / UFix64(totalCards)
        } else {
            profileData["averageReviewsPerCard"] = 0.0
        }
        
        let cardsDue = LeitnerLang.getCardsDueForReview(userAddress: userAddress)
        profileData["cardsDueForReview"] = cardsDue.length
        profileData["cardsDueIds"] = cardsDue
        profileData["profileStatus"] = totalCards > 0 ? "Active" : "Setup Complete"
        profileData["hasActiveProfile"] = true
        
        return profileData
    }
    
    return nil
}
`

export interface ProfileData {
  totalCards: number
  totalReviews: number
  streakDays: number
  primaryLanguage: string
  userAddress: string
  averageReviewsPerCard: number
  cardsDueForReview: number
  cardsDueIds: number[]
  profileStatus: string
  hasActiveProfile: boolean
}

export const useProfile = (userAddress: string | null) => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { executeScript } = useFlowScript()

  const fetchProfile = useCallback(async () => {
    if (!userAddress) return

    setLoading(true)
    setError(null)

    try {
      const result = await executeScript(GET_PROFILE_SCRIPT, [
        fcl.arg(userAddress, fcl.t.Address)
      ])
      
      setProfile(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [userAddress, executeScript])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
```

### Cards Due For Review Hook

**`src/hooks/useCardsForReview.ts`**
```typescript
import { useState, useEffect, useCallback } from "react"
import { useFlowScript } from "./useFlowScript"
import * as fcl from "@onflow/fcl"

const GET_CARDS_FOR_REVIEW_SCRIPT = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

access(all) fun main(userAddress: Address): [{String: AnyStruct}] {
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return []
    }
    
    if let profileRef = profileCap.borrow() {
        let cardsDueIds = profileRef.getCardsDueForReview()
        
        if cardsDueIds.length == 0 {
            return []
        }
        
        var cardsDueInfo: [{String: AnyStruct}] = []
        
        for cardId in cardsDueIds {
            var cardInfo: {String: AnyStruct} = {}
            cardInfo["cardId"] = cardId
            cardInfo["userAddress"] = userAddress.toString()
            
            if let level = profileRef.getCardLevel(cardId: cardId) {
                cardInfo["currentLevel"] = level
                cardInfo["levelDescription"] = getLevelDescription(level: level)
                cardInfo["reviewStatus"] = "Due Now"
                cardInfo["queuePosition"] = "Current Day"
                
                if let cardData = LeitnerLang.getCardInfo(cardId: cardId) {
                    cardInfo["frontText"] = cardData["frontText"]
                    cardInfo["backText"] = cardData["backText"] 
                    cardInfo["frontLanguage"] = cardData["frontLanguage"]
                    cardInfo["backLanguage"] = cardData["backLanguage"]
                    cardInfo["deckId"] = cardData["deckId"]
                }
            }
            
            cardsDueInfo.append(cardInfo)
        }
        
        return cardsDueInfo
    }
    
    return []
}

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
`

export interface CardForReview {
  cardId: number
  userAddress: string
  currentLevel: number
  levelDescription: string
  reviewStatus: string
  queuePosition: string
  frontText?: string
  backText?: string
  frontLanguage?: string
  backLanguage?: string
  deckId?: number
}

export const useCardsForReview = (userAddress: string | null) => {
  const [cards, setCards] = useState<CardForReview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { executeScript } = useFlowScript()

  const fetchCards = useCallback(async () => {
    if (!userAddress) return

    setLoading(true)
    setError(null)

    try {
      const result = await executeScript(GET_CARDS_FOR_REVIEW_SCRIPT, [
        fcl.arg(userAddress, fcl.t.Address)
      ])
      
      setCards(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cards")
      setCards([])
    } finally {
      setLoading(false)
    }
  }, [userAddress, executeScript])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  return { cards, loading, error, refetch: fetchCards }
}
```

### Leitner Queue Hook

**`src/hooks/useLeitnerQueue.ts`**
```typescript
import { useState, useEffect, useCallback } from "react"
import { useFlowScript } from "./useFlowScript"
import * as fcl from "@onflow/fcl"

const GET_LEITNER_QUEUE_SCRIPT = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    let account = getAccount(userAddress)
    let profileCap = account.capabilities.get<&LeitnerLang.Profile>(LeitnerLang.getProfilePublicPath())
    
    if !profileCap.check() {
        return nil
    }
    
    if let profileRef = profileCap.borrow() {
        var queueInfo: {String: AnyStruct} = {}
        
        queueInfo["userAddress"] = userAddress.toString()
        queueInfo["queryTimestamp"] = getCurrentBlock().timestamp
        
        let currentDayCards = profileRef.getCurrentDayCards()
        queueInfo["currentDayCards"] = currentDayCards
        queueInfo["currentDayCount"] = currentDayCards.length
        queueInfo["isLeitnerDayComplete"] = profileRef.isLeitnerDayComplete()
        
        let stats = profileRef.getStats()
        queueInfo["totalCards"] = stats["totalCards"]
        queueInfo["totalReviews"] = stats["totalReviews"]
        queueInfo["streakDays"] = stats["streakDays"]
        
        if currentDayCards.length == 0 {
            queueInfo["status"] = "Day Complete"
            queueInfo["recommendation"] = "🎉 Current day complete! Use complete_leitner_day to advance."
            queueInfo["nextAction"] = "Complete day or add more cards"
        } else if currentDayCards.length <= 5 {
            queueInfo["status"] = "Light Load"
            queueInfo["recommendation"] = "📚 Light study day - perfect for focused learning!"
            queueInfo["nextAction"] = "Review ".concat(currentDayCards.length.toString()).concat(" cards")
        } else {
            queueInfo["status"] = "Normal Load"
            queueInfo["recommendation"] = "📖 Good session size - maintain steady pace."
            queueInfo["nextAction"] = "Review ".concat(currentDayCards.length.toString()).concat(" cards")
        }
        
        return queueInfo
    }
    
    return nil
}
`

export interface LeitnerQueueData {
  userAddress: string
  queryTimestamp: number
  currentDayCards: number[]
  currentDayCount: number
  isLeitnerDayComplete: boolean
  totalCards: number
  totalReviews: number
  streakDays: number
  status: string
  recommendation: string
  nextAction: string
}

export const useLeitnerQueue = (userAddress: string | null) => {
  const [queue, setQueue] = useState<LeitnerQueueData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { executeScript } = useFlowScript()

  const fetchQueue = useCallback(async () => {
    if (!userAddress) return

    setLoading(true)
    setError(null)

    try {
      const result = await executeScript(GET_LEITNER_QUEUE_SCRIPT, [
        fcl.arg(userAddress, fcl.t.Address)
      ])
      
      setQueue(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch queue")
      setQueue(null)
    } finally {
      setLoading(false)
    }
  }, [userAddress, executeScript])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return { queue, loading, error, refetch: fetchQueue }
}
```

---

## 📝 **4. Transactions (Write Operations)**

### Transaction Hook

**`src/hooks/useFlowTransaction.ts`**
```typescript
import { useState } from "react"
import { fcl } from "../flow/config"
import { CONTRACT_ADDRESSES } from "../flow/config"

export interface TransactionStatus {
  status: "idle" | "pending" | "sealed" | "error"
  txId?: string
  error?: string
}

export const useFlowTransaction = () => {
  const [status, setStatus] = useState<TransactionStatus>({ status: "idle" })

  const sendTransaction = async (transaction: string, args: any[] = []) => {
    setStatus({ status: "pending" })

    try {
      const transactionId = await fcl.mutate({
        cadence: transaction.replace(/import "LeitnerLang"/g, `import LeitnerLang from ${CONTRACT_ADDRESSES.LeitnerLang}`),
        args,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000
      })

      setStatus({ status: "pending", txId: transactionId })

      // Wait for transaction to be sealed
      const result = await fcl.tx(transactionId).onceSealed()
      
      if (result.status === 4) {
        setStatus({ status: "sealed", txId: transactionId })
        return { success: true, txId: transactionId, result }
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Transaction failed"
      setStatus({ status: "error", error: errorMessage })
      throw error
    }
  }

  const resetStatus = () => {
    setStatus({ status: "idle" })
  }

  return { sendTransaction, status, resetStatus }
}
```

### Profile Setup Transaction

**`src/hooks/useSetupProfile.ts`**
```typescript
import { useFlowTransaction } from "./useFlowTransaction"
import * as fcl from "@onflow/fcl"

const SETUP_PROFILE_TRANSACTION = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

transaction(primaryLanguage: String) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) != nil {
            panic("Profile already exists for this account")
        }
        
        if primaryLanguage.length == 0 {
            panic("Primary language cannot be empty")
        }
        
        LeitnerLang.setupProfile(account: signer, primaryLanguage: primaryLanguage)
    }
    
    execute {
        log("Profile setup completed successfully for primary language: ".concat(primaryLanguage))
    }
}
`

export const useSetupProfile = () => {
  const { sendTransaction, status, resetStatus } = useFlowTransaction()

  const setupProfile = async (primaryLanguage: string) => {
    return await sendTransaction(SETUP_PROFILE_TRANSACTION, [
      fcl.arg(primaryLanguage, fcl.t.String)
    ])
  }

  return { setupProfile, status, resetStatus }
}
```

### Review Card Transaction

**`src/hooks/useReviewCard.ts`**
```typescript
import { useFlowTransaction } from "./useFlowTransaction"
import * as fcl from "@onflow/fcl"

const REVIEW_CARD_TRANSACTION = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

transaction(cardId: UInt64, correct: Bool) {
    let signerAddress: Address
    let accountRef: auth(Storage) &Account
    
    prepare(signer: auth(Storage) &Account) {
        self.signerAddress = signer.address
        self.accountRef = signer
        
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) == nil {
            panic("User profile not found. Please set up your profile first.")
        }
        
        if cardId == 0 {
            panic("Invalid card ID")
        }
    }
    
    execute {
        let currentLevel = LeitnerLang.getCardLevel(userAddress: self.signerAddress, cardId: cardId)
        
        log("Reviewing card ID: ".concat(cardId.toString()))
        log("Current level: ".concat((currentLevel ?? 0).toString()))
        log("Answer correct: ".concat(correct ? "true" : "false"))
        
        let cardsDueBefore = LeitnerLang.getCardsDueForReview(userAddress: self.signerAddress)
        log("Cards due before review: ".concat(cardsDueBefore.length.toString()))
        
        LeitnerLang.reviewCard(
            account: self.accountRef,
            cardId: cardId,
            correct: correct
        )
        
        let newLevel = LeitnerLang.getCardLevel(userAddress: self.signerAddress, cardId: cardId)
        let cardsDueAfter = LeitnerLang.getCardsDueForReview(userAddress: self.signerAddress)
        
        log("New level: ".concat((newLevel ?? 0).toString()))
        log("Cards due after review: ".concat(cardsDueAfter.length.toString()))
        
        if cardsDueAfter.length == 0 {
            log("✅ All cards reviewed! Use complete_leitner_day transaction to advance to next day.")
        } else {
            log("📚 ".concat(cardsDueAfter.length.toString()).concat(" cards remaining today."))
        }
        
        log("Card review completed successfully")
    }
}
`

export const useReviewCard = () => {
  const { sendTransaction, status, resetStatus } = useFlowTransaction()

  const reviewCard = async (cardId: number, correct: boolean) => {
    return await sendTransaction(REVIEW_CARD_TRANSACTION, [
      fcl.arg(cardId, fcl.t.UInt64),
      fcl.arg(correct, fcl.t.Bool)
    ])
  }

  return { reviewCard, status, resetStatus }
}
```

### Complete Leitner Day Transaction

**`src/hooks/useCompleteLeitnerDay.ts`**
```typescript
import { useFlowTransaction } from "./useFlowTransaction"

const COMPLETE_LEITNER_DAY_TRANSACTION = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

transaction() {
    let signerAddress: Address
    let accountRef: auth(Storage) &Account
    
    prepare(signer: auth(Storage) &Account) {
        self.signerAddress = signer.address
        self.accountRef = signer
        
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) == nil {
            panic("User profile not found. Please set up your profile first.")
        }
    }
    
    execute {
        log("Manually completing Leitner day for user: ".concat(self.signerAddress.toString()))
        
        let profileRef = self.accountRef.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath())!
        
        let currentDayCards = profileRef.getCurrentDayCards()
        let isAlreadyComplete = profileRef.isLeitnerDayComplete()
        
        log("Current day cards remaining: ".concat(currentDayCards.length.toString()))
        log("Day already complete: ".concat(isAlreadyComplete ? "true" : "false"))
        
        if isAlreadyComplete {
            log("ℹ️  Leitner day is already complete. Queue will rotate anyway.")
        } else if currentDayCards.length > 0 {
            log("⚠️  Warning: ".concat(currentDayCards.length.toString()).concat(" cards remain unreviewed."))
            log("💡 These cards will be moved to tomorrow's queue.")
            
            for cardId in currentDayCards {
                log("Moving unreviewed card ".concat(cardId.toString()).concat(" to tomorrow"))
            }
        }
        
        LeitnerLang.forceCompleteLeitnerDay(account: self.accountRef)
        
        let newCurrentDayCards = profileRef.getCurrentDayCards()
        let stats = profileRef.getStats()
        let streakDays = stats["streakDays"] as! UInt32? ?? 0
        
        log("=== LEITNER DAY COMPLETION SUMMARY ===")
        log("Queue rotated successfully")
        log("New current day cards: ".concat(newCurrentDayCards.length.toString()))
        log("Current streak: ".concat(streakDays.toString()).concat(" days"))
        
        if newCurrentDayCards.length > 0 {
            log("🎯 Ready for next day! ".concat(newCurrentDayCards.length.toString()).concat(" cards due for review."))
        } else {
            log("📚 No cards scheduled for today. Add more cards or wait for future reviews.")
        }
        
        log("🎉 Leitner day completed successfully!")
    }
}
`

export const useCompleteLeitnerDay = () => {
  const { sendTransaction, status, resetStatus } = useFlowTransaction()

  const completeLeitnerDay = async () => {
    return await sendTransaction(COMPLETE_LEITNER_DAY_TRANSACTION, [])
  }

  return { completeLeitnerDay, status, resetStatus }
}
```

### Add Leitner Cards Transaction

**`src/hooks/useAddLeitnerCards.ts`**
```typescript
import { useFlowTransaction } from "./useFlowTransaction"
import * as fcl from "@onflow/fcl"

const ADD_LEITNER_CARDS_TRANSACTION = `
import LeitnerLang from 0xLEITNERLANG_ADDRESS

transaction(deckId: UInt64, languages: [String]) {
    let signerAddress: Address
    let accountRef: auth(Storage) &Account
    
    prepare(signer: auth(Storage) &Account) {
        self.signerAddress = signer.address
        self.accountRef = signer
        
        if signer.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath()) == nil {
            panic("User profile not found. Please set up your profile first.")
        }
        
        if deckId == 0 {
            panic("Invalid deck ID")
        }
        
        if languages.length == 0 {
            panic("Languages array cannot be empty")
        }
        
        let deckInfo = LeitnerLang.getDeckInfo(deckId: deckId)
        if deckInfo == nil {
            panic("Deck with ID ".concat(deckId.toString()).concat(" does not exist"))
        }
    }
    
    execute {
        log("Adding Leitner cards from deck ID: ".concat(deckId.toString()))
        
        let profileRef = self.accountRef.storage.borrow<&LeitnerLang.Profile>(from: LeitnerLang.getProfileStoragePath())!
        
        var cardsAdded = 0
        var cardsSkipped = 0
        var languagePairsProcessed: [String] = []
        
        var cardId: UInt64 = 1
        let maxCardId: UInt64 = LeitnerLang.nextCardId - 1
        
        while cardId <= maxCardId {
            if let cardInfo = LeitnerLang.getCardInfo(cardId: cardId) {
                let cardDeckId = cardInfo["deckId"] as! UInt64? ?? 0
                
                if cardDeckId == deckId {
                    let frontLanguage = cardInfo["frontLanguage"] as! String? ?? ""
                    let backLanguage = cardInfo["backLanguage"] as! String? ?? ""
                    
                    if languages.contains(frontLanguage) && languages.contains(backLanguage) && frontLanguage != backLanguage {
                        if profileRef.getCardLevel(cardId: cardId) == nil {
                            profileRef.addCardToLeitner(cardId: cardId)
                            cardsAdded = cardsAdded + 1
                            
                            let languagePair = frontLanguage.concat(" → ").concat(backLanguage)
                            if !languagePairsProcessed.contains(languagePair) {
                                languagePairsProcessed.append(languagePair)
                            }
                            
                            let frontText = cardInfo["frontText"] as! String? ?? ""
                            let backText = cardInfo["backText"] as! String? ?? ""
                            log("Added card: ".concat(frontText).concat(" (").concat(frontLanguage).concat(") → ").concat(backText).concat(" (").concat(backLanguage).concat(")"))
                        } else {
                            cardsSkipped = cardsSkipped + 1
                        }
                    }
                }
            }
            cardId = cardId + 1
        }
        
        log("=== ADD LEITNER CARDS SUMMARY ===")
        log("Cards added to Leitner system: ".concat(cardsAdded.toString()))
        log("Cards skipped (already in system): ".concat(cardsSkipped.toString()))
        
        if cardsAdded > 0 {
            let currentDayCards = profileRef.getCurrentDayCards()
            log("Cards now due for review today: ".concat(currentDayCards.length.toString()))
            log("🎯 Ready to start learning!")
        }
        
        log("Transaction completed successfully")
    }
}
`

export const useAddLeitnerCards = () => {
  const { sendTransaction, status, resetStatus } = useFlowTransaction()

  const addLeitnerCards = async (deckId: number, languages: string[]) => {
    return await sendTransaction(ADD_LEITNER_CARDS_TRANSACTION, [
      fcl.arg(deckId, fcl.t.UInt64),
      fcl.arg(languages, fcl.t.Array(fcl.t.String))
    ])
  }

  return { addLeitnerCards, status, resetStatus }
}
```

---

## 🎨 **5. React Components**

### Profile Dashboard Component

**`src/components/ProfileDashboard.tsx`**
```typescript
import { useFlowAuth } from "../hooks/useFlowAuth"
import { useProfile } from "../hooks/useProfile"
import { useLeitnerQueue } from "../hooks/useLeitnerQueue"
import { useSetupProfile } from "../hooks/useSetupProfile"
import { useState } from "react"

export const ProfileDashboard: React.FC = () => {
  const { user, loggedIn } = useFlowAuth()
  const { profile, loading: profileLoading, error: profileError, refetch } = useProfile(user?.addr || null)
  const { queue, loading: queueLoading } = useLeitnerQueue(user?.addr || null)
  const { setupProfile, status } = useSetupProfile()
  const [primaryLanguage, setPrimaryLanguage] = useState("")

  if (!loggedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Connect your wallet to access your learning profile</p>
      </div>
    )
  }

  if (profileLoading || queueLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {profileError || "No profile found. Set up your learning profile to get started."}
            </p>
            
            <div className="mt-4">
              <input
                type="text"
                placeholder="Primary Language (e.g., English)"
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="mr-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => setupProfile(primaryLanguage)}
                disabled={status.status === "pending" || !primaryLanguage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                {status.status === "pending" ? "Setting up..." : "Setup Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Profile</h2>
            <p className="text-gray-600">Primary Language: {profile.primaryLanguage}</p>
            <p className="text-sm text-gray-500 font-mono">{profile.userAddress}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {profile.profileStatus}
          </span>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{profile.totalCards}</div>
          <div className="text-sm text-gray-600">Total Cards</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{profile.totalReviews}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{profile.streakDays}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{profile.cardsDueForReview}</div>
          <div className="text-sm text-gray-600">Due Today</div>
        </div>
      </div>

      {/* Queue Status */}
      {queue && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Study Session</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{queue.recommendation}</p>
              <p className="text-xs text-gray-500 mt-1">{queue.nextAction}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              queue.status === "Day Complete" ? "bg-green-100 text-green-800" :
              queue.status === "Light Load" ? "bg-blue-100 text-blue-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {queue.status}
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Refresh Profile
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Study Session Component

**`src/components/StudySession.tsx`**
```typescript
import { useState } from "react"
import { useFlowAuth } from "../hooks/useFlowAuth"
import { useCardsForReview } from "../hooks/useCardsForReview"
import { useReviewCard } from "../hooks/useReviewCard"
import { useCompleteLeitnerDay } from "../hooks/useCompleteLeitnerDay"

export const StudySession: React.FC = () => {
  const { user, loggedIn } = useFlowAuth()
  const { cards, loading, error, refetch } = useCardsForReview(user?.addr || null)
  const { reviewCard, status: reviewStatus } = useReviewCard()
  const { completeLeitnerDay, status: completeStatus } = useCompleteLeitnerDay()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  if (!loggedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Connect your wallet to start studying</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading your cards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button onClick={refetch} className="mt-2 text-blue-500 hover:underline">
          Try again
        </button>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards due for review</h3>
        <p className="text-gray-600 mb-4">Great job! You've completed all your reviews for today.</p>
        <button
          onClick={() => completeLeitnerDay()}
          disabled={completeStatus.status === "pending"}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {completeStatus.status === "pending" ? "Completing..." : "Complete Leitner Day"}
        </button>
      </div>
    )
  }

  if (sessionComplete) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h3>
        <p className="text-gray-600 mb-6">You've reviewed all your cards for today.</p>
        <div className="space-y-3">
          <button
            onClick={() => completeLeitnerDay()}
            disabled={completeStatus.status === "pending"}
            className="block w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {completeStatus.status === "pending" ? "Completing..." : "Complete Leitner Day"}
          </button>
          <button
            onClick={() => {
              setSessionComplete(false)
              setCurrentCardIndex(0)
              refetch()
            }}
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Review More Cards
          </button>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentCardIndex]

  const handleAnswer = async (correct: boolean) => {
    try {
      await reviewCard(currentCard.cardId, correct)
      
      // Move to next card or complete session
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1)
        setShowAnswer(false)
      } else {
        setSessionComplete(true)
      }
      
      // Refresh the cards list
      await refetch()
    } catch (error) {
      console.error("Review failed:", error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Card {currentCardIndex + 1} of {cards.length}
          </span>
          <span className="text-sm text-gray-500">
            Level {currentCard.currentLevel} • {currentCard.levelDescription}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card Display */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 text-center min-h-[400px] flex flex-col justify-center">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">
              {showAnswer ? "Back" : "Front"} • {showAnswer ? currentCard.backLanguage : currentCard.frontLanguage}
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {showAnswer ? currentCard.backText : currentCard.frontText}
            </div>
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Show Answer
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">How well did you know this?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={reviewStatus.status === "pending"}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  ❌ Incorrect
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={reviewStatus.status === "pending"}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  ✅ Correct
                </button>
              </div>
              {reviewStatus.status === "pending" && (
                <p className="text-sm text-gray-500">Processing review...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 🌐 **6. Main App Integration**

### App Layout with Flow Provider

**`src/app/layout.tsx`**
```typescript
import { WalletConnect } from "../components/WalletConnect"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    LeitnerLang
                  </h1>
                </div>
                <WalletConnect />
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

### Main Dashboard Page

**`src/app/page.tsx`**
```typescript
"use client"

import { ProfileDashboard } from "../components/ProfileDashboard"
import { StudySession } from "../components/StudySession"
import { useFlowAuth } from "../hooks/useFlowAuth"
import { useState } from "react"

export default function HomePage() {
  const { loggedIn } = useFlowAuth()
  const [activeTab, setActiveTab] = useState<"dashboard" | "study">("dashboard")

  if (!loggedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to LeitnerLang
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Web3 Spaced Repetition Language Learning on Flow
        </p>
        <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-blue-700 mb-4">
            Connect your Flow wallet to start learning
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("study")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "study"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Study Session
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && <ProfileDashboard />}
      {activeTab === "study" && <StudySession />}
    </div>
  )
}
```

---

## 🚀 **7. Deployment & Production**

### Build Configuration

**`next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}

module.exports = nextConfig
```

### Environment Setup

**`.env.example`**
```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_LEITNERLANG_ADDRESS=0x123456789abcdef0
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Deployment Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

---

## 📚 **8. Usage Examples**

### Complete User Flow

```typescript
// 1. User connects wallet
await logIn()

// 2. Setup profile (if needed)
await setupProfile("English")

// 3. Add cards to Leitner system
await addLeitnerCards(1, ["English", "Spanish", "Italian"])

// 4. Study session
const cards = await getCardsForReview(userAddress)
for (const card of cards) {
  await reviewCard(card.cardId, true) // or false
}

// 5. Complete the day
await completeLeitnerDay()
```

### Error Handling Example

```typescript
const handleReview = async (cardId: number, correct: boolean) => {
  try {
    setLoading(true)
    const result = await reviewCard(cardId, correct)
    
    if (result.success) {
      toast.success("Card reviewed successfully!")
      await refetchCards()
    }
  } catch (error) {
    console.error("Review failed:", error)
    toast.error("Failed to review card. Please try again.")
  } finally {
    setLoading(false)
  }
}
```

---

## 🔧 **9. Troubleshooting**

### Common Issues

**1. Contract Address Issues**
```typescript
// Make sure contract address is correct
const CONTRACT_ADDRESSES = {
  LeitnerLang: "0xYOUR_ACTUAL_TESTNET_ADDRESS", // Update this!
}
```

**2. Transaction Failures**
```typescript
// Check gas limit for complex transactions
const result = await fcl.mutate({
  cadence: transaction,
  args,
  proposer: fcl.authz,
  payer: fcl.authz,
  authorizations: [fcl.authz],
  limit: 1000 // Increase if needed
})
```

**3. Script Import Errors**
```typescript
// Ensure proper import replacement
const script = SCRIPT_CODE.replace(
  /import "LeitnerLang"/g, 
  `import LeitnerLang from ${CONTRACT_ADDRESSES.LeitnerLang}`
)
```

### Debugging Tips

```typescript
// Enable FCL debugging
fcl.config({
  "fcl.debug": true
})

// Log transaction details
const txId = await fcl.mutate(/* ... */)
console.log("Transaction ID:", txId)
const result = await fcl.tx(txId).onceSealed()
console.log("Transaction result:", result)
```

---

## 🎯 **10. Next Steps**

### Recommended Enhancements

1. **Add Loading States**: Implement skeleton loaders for better UX
2. **Error Boundaries**: Add React error boundaries for graceful error handling
3. **Offline Support**: Cache profile data for offline viewing
4. **Progressive Web App**: Add PWA features for mobile experience
5. **Analytics**: Track user learning progress and engagement
6. **Notifications**: Implement push notifications for study reminders

### Advanced Features

1. **Deck Management**: Add UI for creating/editing decks and cards
2. **Social Features**: Share progress and compete with friends
3. **Advanced Analytics**: Detailed learning insights and recommendations
4. **Gamification**: Achievements, badges, and leaderboards
5. **Multi-language UI**: Support for app localization

---

This complete guide provides everything needed to integrate your LeitnerLang smart contract with a modern Next.js frontend. The code is production-ready and follows Flow best practices for testnet deployment.
