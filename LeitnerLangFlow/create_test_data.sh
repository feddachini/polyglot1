#!/bin/bash

echo "🚀 Creating test decks and cards for LeitnerLang..."
echo "Network: testnet"
echo "Account: testnet-acct-1"
echo ""

# Function to create deck and get its ID
create_deck() {
    local concept="$1"
    local meaning="$2"
    echo "📚 Creating deck: $concept"
    
    flow transactions send cadence/transactions/create_deck.cdc "$concept" "$meaning" \
        --signer testnet-acct-1 \
        --network testnet
    
    echo ""
}

# Function to create card
create_card() {
    local frontText="$1"
    local frontPhonetic="$2"
    local frontLanguage="$3"
    local backText="$4"
    local backPhonetic="$5"
    local backLanguage="$6"
    local deckId="$7"
    
    echo "📝 Creating card: $frontText ($frontLanguage) → $backText ($backLanguage)"
    
    # Handle null phonetics
    if [ "$frontPhonetic" = "null" ]; then
        frontPhonetic=""
    fi
    if [ "$backPhonetic" = "null" ]; then
        backPhonetic=""
    fi
    
    flow transactions send cadence/transactions/create_card.cdc \
        "$frontText" "$frontPhonetic" "$frontLanguage" \
        "$backText" "$backPhonetic" "$backLanguage" \
        $deckId \
        --signer testnet-acct-1 \
        --network testnet
    
    echo ""
}

echo "Creating Deck 1: water"
create_deck "water" "the clear liquid essential for life"

echo "Creating cards for Deck 1 (water)..."
create_card "water" "WAW-ter" "English" "agua" "AH-gwah" "Spanish" 1
create_card "water" "WAW-ter" "English" "acqua" "AH-kwah" "Italian" 1
create_card "water" "WAW-ter" "English" "eau" "OH" "French" 1
create_card "water" "WAW-ter" "English" "Wasser" "VAH-ser" "German" 1
create_card "agua" "AH-gwah" "Spanish" "acqua" "AH-kwah" "Italian" 1
create_card "agua" "AH-gwah" "Spanish" "eau" "OH" "French" 1
create_card "agua" "AH-gwah" "Spanish" "Wasser" "VAH-ser" "German" 1
create_card "acqua" "AH-kwah" "Italian" "agua" "AH-gwah" "Spanish" 1
create_card "acqua" "AH-kwah" "Italian" "eau" "OH" "French" 1
create_card "acqua" "AH-kwah" "Italian" "Wasser" "VAH-ser" "German" 1
create_card "eau" "OH" "French" "agua" "AH-gwah" "Spanish" 1
create_card "eau" "OH" "French" "acqua" "AH-kwah" "Italian" 1
create_card "eau" "OH" "French" "Wasser" "VAH-ser" "German" 1
create_card "agua" "AH-gwah" "Spanish" "water" "WAW-ter" "English" 1
create_card "acqua" "AH-kwah" "Italian" "water" "WAW-ter" "English" 1
create_card "eau" "OH" "French" "water" "WAW-ter" "English" 1
create_card "Wasser" "VAH-ser" "German" "water" "WAW-ter" "English" 1
create_card "Wasser" "VAH-ser" "German" "agua" "AH-gwah" "Spanish" 1
create_card "Wasser" "VAH-ser" "German" "acqua" "AH-kwah" "Italian" 1
create_card "Wasser" "VAH-ser" "German" "eau" "OH" "French" 1

echo "Creating Deck 2: house"
create_deck "house" "a building for human habitation"

echo "Creating cards for Deck 2 (house)..."
create_card "house" "HOWSS" "English" "casa" "KAH-sah" "Spanish" 2
create_card "house" "HOWSS" "English" "casa" "KAH-zah" "Italian" 2
create_card "house" "HOWSS" "English" "maison" "may-ZOHN" "French" 2
create_card "house" "HOWSS" "English" "Haus" "HOWSS" "German" 2
create_card "casa" "KAH-sah" "Spanish" "casa" "KAH-zah" "Italian" 2
create_card "casa" "KAH-sah" "Spanish" "maison" "may-ZOHN" "French" 2
create_card "casa" "KAH-sah" "Spanish" "Haus" "HOWSS" "German" 2
create_card "casa" "KAH-zah" "Italian" "casa" "KAH-sah" "Spanish" 2
create_card "casa" "KAH-zah" "Italian" "maison" "may-ZOHN" "French" 2
create_card "casa" "KAH-zah" "Italian" "Haus" "HOWSS" "German" 2
create_card "maison" "may-ZOHN" "French" "casa" "KAH-sah" "Spanish" 2
create_card "maison" "may-ZOHN" "French" "casa" "KAH-zah" "Italian" 2
create_card "maison" "may-ZOHN" "French" "Haus" "HOWSS" "German" 2
create_card "casa" "KAH-sah" "Spanish" "house" "HOWSS" "English" 2
create_card "casa" "KAH-zah" "Italian" "house" "HOWSS" "English" 2
create_card "maison" "may-ZOHN" "French" "house" "HOWSS" "English" 2
create_card "Haus" "HOWSS" "German" "house" "HOWSS" "English" 2
create_card "Haus" "HOWSS" "German" "casa" "KAH-sah" "Spanish" 2
create_card "Haus" "HOWSS" "German" "casa" "KAH-zah" "Italian" 2
create_card "Haus" "HOWSS" "German" "maison" "may-ZOHN" "French" 2

echo "Creating Deck 3: love"
create_deck "love" "an intense feeling of deep affection"

echo "Creating cards for Deck 3 (love)..."
create_card "love" "LUHV" "English" "amor" "ah-MORE" "Spanish" 3
create_card "love" "LUHV" "English" "amore" "ah-MORE-eh" "Italian" 3
create_card "love" "LUHV" "English" "amour" "ah-MOOR" "French" 3
create_card "love" "LUHV" "English" "Liebe" "LEE-beh" "German" 3

echo "🎉 Test data creation complete!"
echo "📊 Created 3 decks with multilingual vocabulary cards"
echo "🔍 You can now test the learning system with real data!" 