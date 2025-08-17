#!/bin/bash

echo "🚀 Creating test decks and cards for LeitnerLang..."
echo "Network: testnet"
echo "Account: testnet-acct-1"
echo ""

# Function to create deck
create_deck() {
    local concept="$1"
    local meaning="$2"
    echo "📚 Creating deck: $concept"
    
    flow transactions send cadence/transactions/create_deck.cdc "$concept" "$meaning" \
        --signer testnet-acct-1 \
        --network testnet
    
    echo ""
}

# Function to create card (simplified - no phonetics to avoid Flow CLI issues)
create_card_simple() {
    local frontText="$1"
    local frontLanguage="$2"
    local backText="$3"
    local backLanguage="$4"
    local deckId="$5"
    
    echo "📝 Creating card: $frontText ($frontLanguage) → $backText ($backLanguage)"
    
    # Use empty strings for phonetics to avoid Flow CLI optional parameter issues
    flow transactions send cadence/transactions/create_card.cdc \
        "$frontText" "" "$frontLanguage" \
        "$backText" "" "$backLanguage" \
        $deckId \
        --signer testnet-acct-1 \
        --network testnet
    
    echo ""
}

echo "=== Creating Deck 1: water ==="
create_deck "water" "the clear liquid essential for life"

echo "Creating key cards for Deck 1 (water)..."
create_card_simple "water" "English" "agua" "Spanish" 1
create_card_simple "water" "English" "acqua" "Italian" 1
create_card_simple "water" "English" "eau" "French" 1
create_card_simple "water" "English" "Wasser" "German" 1

echo "=== Creating Deck 2: house ==="
create_deck "house" "a building for human habitation"

echo "Creating key cards for Deck 2 (house)..."
create_card_simple "house" "English" "casa" "Spanish" 2
create_card_simple "house" "English" "casa" "Italian" 2
create_card_simple "house" "English" "maison" "French" 2
create_card_simple "house" "English" "Haus" "German" 2

echo "=== Creating Deck 3: love ==="
create_deck "love" "an intense feeling of deep affection"

echo "Creating key cards for Deck 3 (love)..."
create_card_simple "love" "English" "amor" "Spanish" 3
create_card_simple "love" "English" "amore" "Italian" 3
create_card_simple "love" "English" "amour" "French" 3
create_card_simple "love" "English" "Liebe" "German" 3

echo "=== Creating Deck 4: food ==="
create_deck "food" "any nutritious substance that people eat or drink"

echo "Creating key cards for Deck 4 (food)..."
create_card_simple "food" "English" "comida" "Spanish" 4
create_card_simple "food" "English" "cibo" "Italian" 4
create_card_simple "food" "English" "nourriture" "French" 4
create_card_simple "food" "English" "Essen" "German" 4

echo "=== Creating Deck 5: hello ==="
create_deck "hello" "used as a greeting or to begin a phone conversation"

echo "Creating key cards for Deck 5 (hello)..."
create_card_simple "hello" "English" "hola" "Spanish" 5
create_card_simple "hello" "English" "ciao" "Italian" 5
create_card_simple "hello" "English" "bonjour" "French" 5
create_card_simple "hello" "English" "hallo" "German" 5

echo "🎉 Test data creation complete!"
echo "📊 Created 5 decks with 20 vocabulary cards"
echo "🔍 You can now test the learning system with real data!"
echo ""
echo "Next steps:"
echo "1. Use 'add_leitner_cards' transaction to add cards to your learning queue"
echo "2. Use 'get_cards_for_review' script to see cards due for study"
echo "3. Use 'review_card' transaction to practice and progress through levels" 