#!/bin/bash

# Comprehensive vocabulary data creation script for LeitnerLang
# This script creates 8 new decks with full multilingual card sets

echo "🚀 Starting comprehensive vocabulary data creation..."
echo "=================================================="

# Function to create deck
create_deck() {
    local concept="$1"
    local meaning="$2"
    echo "📚 Creating deck: $concept"
    flow transactions send cadence/transactions/create_deck.cdc "$concept" "$meaning" --network testnet --signer testnet-acct-1
    if [ $? -eq 0 ]; then
        echo "✅ Deck '$concept' created successfully"
    else
        echo "❌ Failed to create deck '$concept'"
        return 1
    fi
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
    
    echo "  📝 Creating card: $frontText ($frontLanguage) → $backText ($backLanguage)"
    flow transactions send cadence/transactions/create_card_simple.cdc "$frontText" "$frontPhonetic" "$frontLanguage" "$backText" "$backPhonetic" "$backLanguage" "$deckId" --network testnet --signer testnet-acct-1
    if [ $? -eq 0 ]; then
        echo "    ✅ Card created successfully"
    else
        echo "    ❌ Failed to create card"
        return 1
    fi
}

# DECK 5: LOVE
echo ""
echo "💖 Creating 'love' deck and cards..."
create_deck "love" "an intense feeling of deep affection"

# Love cards (deckId: 5)
create_card "love" "LUHV" "English" "amor" "ah-MORE" "Spanish" "5"
create_card "love" "LUHV" "English" "amore" "ah-MORE-eh" "Italian" "5"
create_card "love" "LUHV" "English" "amour" "ah-MOOR" "French" "5"
create_card "love" "LUHV" "English" "Liebe" "LEE-beh" "German" "5"
create_card "amor" "ah-MORE" "Spanish" "amore" "ah-MORE-eh" "Italian" "5"
create_card "amor" "ah-MORE" "Spanish" "amour" "ah-MOOR" "French" "5"
create_card "amor" "ah-MORE" "Spanish" "Liebe" "LEE-beh" "German" "5"
create_card "amore" "ah-MORE-eh" "Italian" "amor" "ah-MORE" "Spanish" "5"
create_card "amore" "ah-MORE-eh" "Italian" "amour" "ah-MOOR" "French" "5"
create_card "amore" "ah-MORE-eh" "Italian" "Liebe" "LEE-beh" "German" "5"
create_card "amour" "ah-MOOR" "French" "amor" "ah-MORE" "Spanish" "5"
create_card "amour" "ah-MOOR" "French" "amore" "ah-MORE-eh" "Italian" "5"
create_card "amour" "ah-MOOR" "French" "Liebe" "LEE-beh" "German" "5"
create_card "amor" "ah-MORE" "Spanish" "love" "LUHV" "English" "5"
create_card "amore" "ah-MORE-eh" "Italian" "love" "LUHV" "English" "5"
create_card "amour" "ah-MOOR" "French" "love" "LUHV" "English" "5"
create_card "Liebe" "LEE-beh" "German" "love" "LUHV" "English" "5"
create_card "Liebe" "LEE-beh" "German" "amor" "ah-MORE" "Spanish" "5"
create_card "Liebe" "LEE-beh" "German" "amore" "ah-MORE-eh" "Italian" "5"
create_card "Liebe" "LEE-beh" "German" "amour" "ah-MOOR" "French" "5"

# DECK 6: FOOD
echo ""
echo "🍽️ Creating 'food' deck and cards..."
create_deck "food" "any nutritious substance that people eat or drink"

# Food cards (deckId: 6)
create_card "food" "FOOD" "English" "comida" "koh-MEE-dah" "Spanish" "6"
create_card "food" "FOOD" "English" "cibo" "CHEE-boh" "Italian" "6"
create_card "food" "FOOD" "English" "nourriture" "noor-ree-TOOR" "French" "6"
create_card "food" "FOOD" "English" "Essen" "EH-sen" "German" "6"
create_card "comida" "koh-MEE-dah" "Spanish" "cibo" "CHEE-boh" "Italian" "6"
create_card "comida" "koh-MEE-dah" "Spanish" "nourriture" "noor-ree-TOOR" "French" "6"
create_card "comida" "koh-MEE-dah" "Spanish" "Essen" "EH-sen" "German" "6"
create_card "cibo" "CHEE-boh" "Italian" "comida" "koh-MEE-dah" "Spanish" "6"
create_card "cibo" "CHEE-boh" "Italian" "nourriture" "noor-ree-TOOR" "French" "6"
create_card "cibo" "CHEE-boh" "Italian" "Essen" "EH-sen" "German" "6"
create_card "nourriture" "noor-ree-TOOR" "French" "comida" "koh-MEE-dah" "Spanish" "6"
create_card "nourriture" "noor-ree-TOOR" "French" "cibo" "CHEE-boh" "Italian" "6"
create_card "nourriture" "noor-ree-TOOR" "French" "Essen" "EH-sen" "German" "6"
create_card "comida" "koh-MEE-dah" "Spanish" "food" "FOOD" "English" "6"
create_card "cibo" "CHEE-boh" "Italian" "food" "FOOD" "English" "6"
create_card "nourriture" "noor-ree-TOOR" "French" "food" "FOOD" "English" "6"
create_card "Essen" "EH-sen" "German" "food" "FOOD" "English" "6"
create_card "Essen" "EH-sen" "German" "comida" "koh-MEE-dah" "Spanish" "6"
create_card "Essen" "EH-sen" "German" "cibo" "CHEE-boh" "Italian" "6"
create_card "Essen" "EH-sen" "German" "nourriture" "noor-ree-TOOR" "French" "6"

# DECK 7: TIME
echo ""
echo "⏰ Creating 'time' deck and cards..."
create_deck "time" "the indefinite continued progress of existence"

# Time cards (deckId: 7)
create_card "time" "TIME" "English" "tiempo" "tee-EHM-poh" "Spanish" "7"
create_card "time" "TIME" "English" "tempo" "TEHM-poh" "Italian" "7"
create_card "time" "TIME" "English" "temps" "TAHN" "French" "7"
create_card "time" "TIME" "English" "Zeit" "TSITE" "German" "7"
create_card "tiempo" "tee-EHM-poh" "Spanish" "tempo" "TEHM-poh" "Italian" "7"
create_card "tiempo" "tee-EHM-poh" "Spanish" "temps" "TAHN" "French" "7"
create_card "tiempo" "tee-EHM-poh" "Spanish" "Zeit" "TSITE" "German" "7"
create_card "tempo" "TEHM-poh" "Italian" "tiempo" "tee-EHM-poh" "Spanish" "7"
create_card "tempo" "TEHM-poh" "Italian" "temps" "TAHN" "French" "7"
create_card "tempo" "TEHM-poh" "Italian" "Zeit" "TSITE" "German" "7"
create_card "temps" "TAHN" "French" "tiempo" "tee-EHM-poh" "Spanish" "7"
create_card "temps" "TAHN" "French" "tempo" "TEHM-poh" "Italian" "7"
create_card "temps" "TAHN" "French" "Zeit" "TSITE" "German" "7"
create_card "tiempo" "tee-EHM-poh" "Spanish" "time" "TIME" "English" "7"
create_card "tempo" "TEHM-poh" "Italian" "time" "TIME" "English" "7"
create_card "temps" "TAHN" "French" "time" "TIME" "English" "7"
create_card "Zeit" "TSITE" "German" "time" "TIME" "English" "7"
create_card "Zeit" "TSITE" "German" "tiempo" "tee-EHM-poh" "Spanish" "7"
create_card "Zeit" "TSITE" "German" "tempo" "TEHM-poh" "Italian" "7"
create_card "Zeit" "TSITE" "German" "temps" "TAHN" "French" "7"

# DECK 8: BOOK
echo ""
echo "📖 Creating 'book' deck and cards..."
create_deck "book" "a written or printed work consisting of pages"

# Book cards (deckId: 8)
create_card "book" "BOOK" "English" "libro" "LEE-broh" "Spanish" "8"
create_card "book" "BOOK" "English" "libro" "LEE-broh" "Italian" "8"
create_card "book" "BOOK" "English" "livre" "LEE-vruh" "French" "8"
create_card "book" "BOOK" "English" "Buch" "BOOKH" "German" "8"
create_card "libro" "LEE-broh" "Spanish" "libro" "LEE-broh" "Italian" "8"
create_card "libro" "LEE-broh" "Spanish" "livre" "LEE-vruh" "French" "8"
create_card "libro" "LEE-broh" "Spanish" "Buch" "BOOKH" "German" "8"
create_card "libro" "LEE-broh" "Italian" "libro" "LEE-broh" "Spanish" "8"
create_card "libro" "LEE-broh" "Italian" "livre" "LEE-vruh" "French" "8"
create_card "libro" "LEE-broh" "Italian" "Buch" "BOOKH" "German" "8"
create_card "livre" "LEE-vruh" "French" "libro" "LEE-broh" "Spanish" "8"
create_card "livre" "LEE-vruh" "French" "libro" "LEE-broh" "Italian" "8"
create_card "livre" "LEE-vruh" "French" "Buch" "BOOKH" "German" "8"
create_card "libro" "LEE-broh" "Spanish" "book" "BOOK" "English" "8"
create_card "libro" "LEE-broh" "Italian" "book" "BOOK" "English" "8"
create_card "livre" "LEE-vruh" "French" "book" "BOOK" "English" "8"
create_card "Buch" "BOOKH" "German" "book" "BOOK" "English" "8"
create_card "Buch" "BOOKH" "German" "libro" "LEE-broh" "Spanish" "8"
create_card "Buch" "BOOKH" "German" "libro" "LEE-broh" "Italian" "8"
create_card "Buch" "BOOKH" "German" "livre" "LEE-vruh" "French" "8"

# DECK 9: FRIEND
echo ""
echo "👥 Creating 'friend' deck and cards..."
create_deck "friend" "a person whom one knows and with whom one has a bond of mutual affection"

# Friend cards (deckId: 9)
create_card "friend" "FREND" "English" "amigo" "ah-MEE-goh" "Spanish" "9"
create_card "friend" "FREND" "English" "amico" "ah-MEE-koh" "Italian" "9"
create_card "friend" "FREND" "English" "ami" "ah-MEE" "French" "9"
create_card "friend" "FREND" "English" "Freund" "FROYND" "German" "9"
create_card "amigo" "ah-MEE-goh" "Spanish" "amico" "ah-MEE-koh" "Italian" "9"
create_card "amigo" "ah-MEE-goh" "Spanish" "ami" "ah-MEE" "French" "9"
create_card "amigo" "ah-MEE-goh" "Spanish" "Freund" "FROYND" "German" "9"
create_card "amico" "ah-MEE-koh" "Italian" "amigo" "ah-MEE-goh" "Spanish" "9"
create_card "amico" "ah-MEE-koh" "Italian" "ami" "ah-MEE" "French" "9"
create_card "amico" "ah-MEE-koh" "Italian" "Freund" "FROYND" "German" "9"
create_card "ami" "ah-MEE" "French" "amigo" "ah-MEE-goh" "Spanish" "9"
create_card "ami" "ah-MEE" "French" "amico" "ah-MEE-koh" "Italian" "9"
create_card "ami" "ah-MEE" "French" "Freund" "FROYND" "German" "9"
create_card "amigo" "ah-MEE-goh" "Spanish" "friend" "FREND" "English" "9"
create_card "amico" "ah-MEE-koh" "Italian" "friend" "FREND" "English" "9"
create_card "ami" "ah-MEE" "French" "friend" "FREND" "English" "9"
create_card "Freund" "FROYND" "German" "friend" "FREND" "English" "9"
create_card "Freund" "FROYND" "German" "amigo" "ah-MEE-goh" "Spanish" "9"
create_card "Freund" "FROYND" "German" "amico" "ah-MEE-koh" "Italian" "9"
create_card "Freund" "FROYND" "German" "ami" "ah-MEE" "French" "9"

# DECK 10: SCHOOL
echo ""
echo "🏫 Creating 'school' deck and cards..."
create_deck "school" "an institution for educating children"

# School cards (deckId: 10)
create_card "school" "SKOOL" "English" "escuela" "es-KWAY-lah" "Spanish" "10"
create_card "school" "SKOOL" "English" "scuola" "SKWOH-lah" "Italian" "10"
create_card "school" "SKOOL" "English" "école" "ay-KOHL" "French" "10"
create_card "school" "SKOOL" "English" "Schule" "SHOO-leh" "German" "10"
create_card "escuela" "es-KWAY-lah" "Spanish" "scuola" "SKWOH-lah" "Italian" "10"
create_card "escuela" "es-KWAY-lah" "Spanish" "école" "ay-KOHL" "French" "10"
create_card "escuela" "es-KWAY-lah" "Spanish" "Schule" "SHOO-leh" "German" "10"
create_card "scuola" "SKWOH-lah" "Italian" "escuela" "es-KWAY-lah" "Spanish" "10"
create_card "scuola" "SKWOH-lah" "Italian" "école" "ay-KOHL" "French" "10"
create_card "scuola" "SKWOH-lah" "Italian" "Schule" "SHOO-leh" "German" "10"
create_card "école" "ay-KOHL" "French" "escuela" "es-KWAY-lah" "Spanish" "10"
create_card "école" "ay-KOHL" "French" "scuola" "SKWOH-lah" "Italian" "10"
create_card "école" "ay-KOHL" "French" "Schule" "SHOO-leh" "German" "10"
create_card "escuela" "es-KWAY-lah" "Spanish" "school" "SKOOL" "English" "10"
create_card "scuola" "SKWOH-lah" "Italian" "school" "SKOOL" "English" "10"
create_card "école" "ay-KOHL" "French" "school" "SKOOL" "English" "10"
create_card "Schule" "SHOO-leh" "German" "school" "SKOOL" "English" "10"
create_card "Schule" "SHOO-leh" "German" "escuela" "es-KWAY-lah" "Spanish" "10"
create_card "Schule" "SHOO-leh" "German" "scuola" "SKWOH-lah" "Italian" "10"
create_card "Schule" "SHOO-leh" "German" "école" "ay-KOHL" "French" "10"

# DECK 11: FAMILY
echo ""
echo "👨‍👩‍👧‍👦 Creating 'family' deck and cards..."
create_deck "family" "a group of one or more parents and their children living together"

# Family cards (deckId: 11)
create_card "family" "FAM-ih-lee" "English" "familia" "fah-MEE-lee-ah" "Spanish" "11"
create_card "family" "FAM-ih-lee" "English" "famiglia" "fah-MEE-lyah" "Italian" "11"
create_card "family" "FAM-ih-lee" "English" "famille" "fah-MEEL" "French" "11"
create_card "family" "FAM-ih-lee" "English" "Familie" "fah-MEE-lee-eh" "German" "11"
create_card "familia" "fah-MEE-lee-ah" "Spanish" "famiglia" "fah-MEE-lyah" "Italian" "11"
create_card "familia" "fah-MEE-lee-ah" "Spanish" "famille" "fah-MEEL" "French" "11"
create_card "familia" "fah-MEE-lee-ah" "Spanish" "Familie" "fah-MEE-lee-eh" "German" "11"
create_card "famiglia" "fah-MEE-lyah" "Italian" "familia" "fah-MEE-lee-ah" "Spanish" "11"
create_card "famiglia" "fah-MEE-lyah" "Italian" "famille" "fah-MEEL" "French" "11"
create_card "famiglia" "fah-MEE-lyah" "Italian" "Familie" "fah-MEE-lee-eh" "German" "11"
create_card "famille" "fah-MEEL" "French" "familia" "fah-MEE-lee-ah" "Spanish" "11"
create_card "famille" "fah-MEEL" "French" "famiglia" "fah-MEE-lyah" "Italian" "11"
create_card "famille" "fah-MEEL" "French" "Familie" "fah-MEE-lee-eh" "German" "11"
create_card "familia" "fah-MEE-lee-ah" "Spanish" "family" "FAM-ih-lee" "English" "11"
create_card "famiglia" "fah-MEE-lyah" "Italian" "family" "FAM-ih-lee" "English" "11"
create_card "famille" "fah-MEEL" "French" "family" "FAM-ih-lee" "English" "11"
create_card "Familie" "fah-MEE-lee-eh" "German" "family" "FAM-ih-lee" "English" "11"
create_card "Familie" "fah-MEE-lee-eh" "German" "familia" "fah-MEE-lee-ah" "Spanish" "11"
create_card "Familie" "fah-MEE-lee-eh" "German" "famiglia" "fah-MEE-lyah" "Italian" "11"
create_card "Familie" "fah-MEE-lee-eh" "German" "famille" "fah-MEEL" "French" "11"

# DECK 12: HELLO
echo ""
echo "👋 Creating 'hello' deck and cards..."
create_deck "hello" "used as a greeting or to begin a phone conversation"

# Hello cards (deckId: 12)
create_card "hello" "heh-LOH" "English" "hola" "OH-lah" "Spanish" "12"
create_card "hello" "heh-LOH" "English" "ciao" "CHOW" "Italian" "12"
create_card "hello" "heh-LOH" "English" "bonjour" "bohn-ZHOOR" "French" "12"
create_card "hello" "heh-LOH" "English" "hallo" "HAH-loh" "German" "12"
create_card "hola" "OH-lah" "Spanish" "ciao" "CHOW" "Italian" "12"
create_card "hola" "OH-lah" "Spanish" "bonjour" "bohn-ZHOOR" "French" "12"
create_card "hola" "OH-lah" "Spanish" "hallo" "HAH-loh" "German" "12"
create_card "ciao" "CHOW" "Italian" "hola" "OH-lah" "Spanish" "12"
create_card "ciao" "CHOW" "Italian" "bonjour" "bohn-ZHOOR" "French" "12"
create_card "ciao" "CHOW" "Italian" "hallo" "HAH-loh" "German" "12"
create_card "bonjour" "bohn-ZHOOR" "French" "hola" "OH-lah" "Spanish" "12"
create_card "bonjour" "bohn-ZHOOR" "French" "ciao" "CHOW" "Italian" "12"
create_card "bonjour" "bohn-ZHOOR" "French" "hallo" "HAH-loh" "German" "12"
create_card "hola" "OH-lah" "Spanish" "hello" "heh-LOH" "English" "12"
create_card "ciao" "CHOW" "Italian" "hello" "heh-LOH" "English" "12"
create_card "bonjour" "bohn-ZHOOR" "French" "hello" "heh-LOH" "English" "12"
create_card "hallo" "HAH-loh" "German" "hello" "heh-LOH" "English" "12"
create_card "hallo" "HAH-loh" "German" "hola" "OH-lah" "Spanish" "12"
create_card "hallo" "HAH-loh" "German" "ciao" "CHOW" "Italian" "12"
create_card "hallo" "HAH-loh" "German" "bonjour" "bohn-ZHOOR" "French" "12"

echo ""
echo "🎉 VOCABULARY DATA CREATION COMPLETE!"
echo "=================================================="
echo "📊 Summary:"
echo "   • 8 new decks created (love, food, time, book, friend, school, family, hello)"
echo "   • ~160 new cards created with full multilingual coverage"
echo "   • Languages: English, Spanish, Italian, French, German"
echo "   • All cards include phonetic pronunciation guides"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the new cards in your app's deck browser"
echo "   2. Try adding cards from different decks to your Leitner system"
echo "   3. Practice with the new vocabulary using different language combinations"
echo ""
echo "✨ Your LeitnerLang system now has comprehensive vocabulary data!" 