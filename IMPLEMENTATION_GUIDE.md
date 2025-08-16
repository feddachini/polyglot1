# Step-by-Step Implementation Guide: Web3 Spaced Repetition Language Learning App on Flow

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)
- A Flow wallet (like Blocto or Lilico) for testnet testing

---

## Phase 1: Environment Setup & Flow Development Tools

### Step 1: Install Flow CLI

```bash
# On macOS using Homebrew
brew install flow-cli

# On Linux/Windows using install script
sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"

# Verify installation
flow version
```

**Expected Output**: Flow CLI version (should be latest stable version)

### Step 2: Install VS Code Extension for Cadence

```bash
code --install-extension onflow.cadence
```

### Step 3: Initialize Flow Project Structure

```bash
# Initialize Flow project (creates flow.json with pre-configured networks)
flow init

# The Flow CLI automatically creates:
# - flow.json with networks (emulator, testnet, mainnet)
# - Empty accounts, contracts, and deployments sections
# - Directory structure is created as needed when you add contracts
```

**AI Prompt for Directory Structure**:
> "Explain the default flow.json configuration created by 'flow init' command. Show how to configure accounts for testnet and mainnet using the latest Flow CLI. Include setup for the dependency manager to install core contracts like NonFungibleToken and FungibleToken."

### Step 4: Set up Flow Accounts

```bash
# Generate a new key pair for development
flow keys generate

# The CLI output will include a testnet faucet URL to create and fund an account
# Example output includes: Private Key, Public Key, and Faucet URL

# Create account on testnet using the faucet URL provided
# Visit the URL to create an account and receive testnet FLOW tokens

# Add the account to your flow.json configuration
flow config accounts add testnet-account
```

**AI Prompt for Account Setup**:
> "Help me configure a Flow testnet account using the generated keys and the testnet faucet. Show me how to properly add the account to flow.json with the latest Flow CLI configuration format, including key management best practices."

---

## Phase 2: Smart Contract Development

### Step 5: Create the Core Data Structures

Create the main contract file:

```bash
touch contracts/LanguageLearning.cdc
```

**AI Prompt for Contract Structure**:
> "Create a Cadence 1.0 smart contract called 'LanguageLearning' with the following resource-oriented structures:
> 1. Phrase struct with text, phonetic, and language fields
> 2. Card resource with id, front/back Phrases, and deck_id
> 3. Deck resource with id, name, and meaning
> 4. Profile resource with primary_language and leitnerCards dictionary
> 5. LeitnerCard struct with date, card_id, and level
> Use Cadence 1.0 syntax with access(all) instead of pub, proper capabilities, and entitlements for secure account storage access."

### Step 6: Implement Core Contract Functions

**AI Prompt for Contract Functions**:
> "Add the following functions to the LanguageLearning contract using Cadence 1.0 syntax:
> 1. createDeck() - creates and stores a new deck
> 2. createCard() - creates a card within a deck
> 3. setupProfile() - initializes user profile in account storage
> 4. reviewCard() - updates card level based on review result
> 5. getCardLevel() - retrieves current card level for user
> 6. getNextReviewDate() - calculates next review based on Leitner algorithm
> Use access(all), access(contract), and entitlements for proper access control. Include capability-based security patterns."

### Step 7: Create Transaction Scripts

```bash
# Create transaction files
touch transactions/setup_profile.cdc
touch transactions/create_deck.cdc
touch transactions/create_card.cdc
touch transactions/review_card.cdc
```

**AI Prompt for Transactions**:
> "Create Cadence 1.0 transaction scripts for:
> 1. setup_profile.cdc - Sets up user profile with primary language using account storage
> 2. create_deck.cdc - Creates a new deck (admin only) with proper entitlements
> 3. create_card.cdc - Adds a card to a deck (admin only) using access control
> 4. review_card.cdc - Records a card review and updates level with capability access
> Use auth(Storage) account references, proper error handling, and emit events. Include pre and post conditions."

### Step 8: Create Query Scripts

```bash
# Create script files for reading data
touch scripts/get_profile.cdc
touch scripts/get_cards_for_review.cdc
touch scripts/get_deck_info.cdc
touch scripts/get_card_level.cdc
```

**AI Prompt for Scripts**:
> "Create Cadence script files for querying:
> 1. get_profile.cdc - Gets user profile information
> 2. get_cards_for_review.cdc - Gets cards due for review for a user
> 3. get_deck_info.cdc - Gets deck information and card count
> 4. get_card_level.cdc - Gets specific card level for a user
> Include proper null checking and error handling."

### Step 9: Install Dependencies and Deploy Contracts

```bash
# Install core contract dependencies
flow dependencies install NonFungibleToken FungibleToken MetadataViews ViewResolver

# Start Flow emulator in a new terminal
flow emulator start

# Deploy the contract to emulator
flow project deploy --network emulator

# Test contract deployment
flow scripts execute scripts/get_deck_info.cdc --network emulator
```

**AI Prompt for Testing**:
> "Create a comprehensive test suite for the LanguageLearning contract using Cadence 1.0 testing framework:
> 1. Profile creation and setup tests with account storage verification
> 2. Deck and card creation tests with proper capability testing
> 3. Card review workflow tests with entitlement validation
> 4. Leitner algorithm progression tests with state verification
> Include both positive and negative test cases using the latest Flow testing patterns."

---

## Phase 3: Frontend Integration

### Step 10: Configure FCL (Flow Client Library)

Update your Next.js project configuration:

```bash
# Install additional dependencies for Flow integration
npm install @onflow/types @onflow/util-encode-key @onflow/util-address

# Create Flow configuration directory
mkdir src/flow
touch src/flow/config.js
touch src/flow/transactions.js
touch src/flow/scripts.js
touch src/flow/wallets.js
```

**AI Prompt for FCL Configuration**:
> "Create FCL configuration for my Next.js app that uses the latest Flow network endpoints:
> 1. Configures connection to Flow testnet (rest-testnet.onflow.org)
> 2. Sets up wallet discovery with discovery.wallet and discovery.authn.endpoint
> 3. Includes contract addresses for Cadence 1.0 core contracts
> 4. Provides authentication hooks with current user subscription
> 5. Includes error handling, loading states, and wallet provider setup"

### Step 11: Create Flow Transaction Helpers

**AI Prompt for Transaction Helpers**:
> "Create JavaScript/TypeScript helper functions that:
> 1. Execute Cadence transactions using FCL
> 2. Handle transaction signing and authorization
> 3. Parse transaction results and errors
> 4. Include proper TypeScript types for all Flow data structures
> 5. Implement retry logic for failed transactions"

### Step 12: Create Flow Script Helpers

**AI Prompt for Script Helpers**:
> "Create JavaScript/TypeScript functions for executing Cadence scripts:
> 1. Query user profiles and card levels
> 2. Get cards due for review
> 3. Fetch deck information
> 4. Calculate review statistics
> Include proper error handling and data transformation."

---

## Phase 4: UI Component Development

### Step 13: Create Authentication Components

```bash
touch src/components/WalletConnect.tsx
touch src/components/AuthProvider.tsx
```

**AI Prompt for Auth Components**:
> "Create React components for Flow wallet authentication:
> 1. WalletConnect - Button component for connecting/disconnecting wallet
> 2. AuthProvider - Context provider for authentication state
> 3. Include loading states, error handling, and user account display
> 4. Use modern React patterns with hooks and TypeScript"

### Step 14: Create Profile Setup Components

```bash
touch src/components/ProfileSetup.tsx
touch src/components/LanguageSelector.tsx
```

**AI Prompt for Profile Components**:
> "Create React components for user onboarding:
> 1. ProfileSetup - Complete profile creation flow
> 2. LanguageSelector - Dropdown for selecting primary language
> 3. Include form validation and submission handling
> 4. Integrate with Flow transactions for profile creation
> 5. Use Tailwind CSS for modern, responsive design"

### Step 15: Create Learning Interface Components

```bash
touch src/components/CardReview.tsx
touch src/components/StudySession.tsx
touch src/components/ProgressTracker.tsx
```

**AI Prompt for Learning Components**:
> "Create React components for the learning interface:
> 1. CardReview - Single card review component with flip animation
> 2. StudySession - Complete study session with progress tracking
> 3. ProgressTracker - Visual progress indicators and statistics
> 4. Include accessibility features and responsive design
> 5. Implement spaced repetition scheduling logic"

---

## Phase 5: Advanced Features

### Step 16: Add Cross-VM Capabilities (Optional)

```bash
# If you want to integrate EVM functionality
npm install @onflow/fcl-rainbowkit-adapter wagmi viem
```

**AI Prompt for Cross-VM Integration**:
> "Add Cross-VM capabilities to enable interaction between Cadence and EVM:
> 1. Set up COA (Cadence Owned Account) for EVM interaction
> 2. Implement batch transactions across VMs
> 3. Add EVM wallet support alongside Flow wallets
> 4. Create bridges for token transfers between VMs
> 5. Implement hybrid functionality using both Cadence and Solidity"

### Step 17: Implement Spaced Repetition Algorithm

**AI Prompt for Algorithm Implementation**:
> "Implement the Leitner spaced repetition algorithm with:
> 1. 7-level system with doubling intervals
> 2. Level progression logic for correct/incorrect answers
> 3. Due date calculation based on current level
> 4. Statistics tracking for learning efficiency
> 5. Integration with Cadence smart contract storage"

### Step 18: Add Deck Management

```bash
touch src/components/DeckManager.tsx
touch src/components/CardEditor.tsx
```

**AI Prompt for Deck Management**:
> "Create administrative components for content management:
> 1. DeckManager - CRUD operations for decks and cards
> 2. CardEditor - Form for creating/editing cards with phonetics
> 3. Include batch operations and import/export functionality
> 4. Implement role-based access control
> 5. Add data validation and error handling"

### Step 19: Create Analytics Dashboard

```bash
touch src/components/Analytics.tsx
touch src/components/LearningStats.tsx
```

**AI Prompt for Analytics**:
> "Create analytics components that show:
> 1. Learning progress over time
> 2. Card difficulty analysis
> 3. Review accuracy statistics
> 4. Streak tracking and achievements
> 5. Visual charts using a charting library like Chart.js or Recharts"

---

## Phase 6: Testing and Deployment

### Step 20: Comprehensive Testing

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Create test files
mkdir __tests__
touch __tests__/contracts.test.js
touch __tests__/components.test.js
```

**AI Prompt for Testing**:
> "Create comprehensive test suites including:
> 1. Unit tests for all React components
> 2. Integration tests for Flow contract interactions
> 3. End-to-end tests for complete user workflows
> 4. Mock implementations for Flow emulator testing
> 5. Performance tests for large datasets"

### Step 21: Deploy to Testnet

```bash
# Update flow.json for testnet deployment
flow accounts create --network testnet

# Deploy contracts to testnet
flow project deploy --network testnet

# Update frontend configuration for testnet
```

**AI Prompt for Testnet Deployment**:
> "Guide me through deploying to Flow testnet:
> 1. Account setup and funding with testnet FLOW
> 2. Contract deployment and verification
> 3. Frontend configuration updates
> 4. Testing deployed contracts with real wallet connections
> 5. Troubleshooting common deployment issues"

### Step 22: Production Deployment

```bash
# Build and deploy frontend
npm run build

# Deploy to hosting platform (Vercel, Netlify, etc.)
```

**AI Prompt for Production Deployment**:
> "Help me prepare for mainnet deployment:
> 1. Security audit checklist for smart contracts
> 2. Gas optimization strategies
> 3. Mainnet account setup and funding requirements
> 4. Frontend deployment to production hosting
> 5. Monitoring and maintenance procedures"

---

## Phase 7: Content Population and Launch

### Step 23: Create Initial Content

**AI Prompt for Content Creation**:
> "Help me create initial language learning content:
> 1. Basic vocabulary decks for popular language pairs (EN->ES, EN->FR, etc.)
> 2. Common phrases and greetings
> 3. Phonetic pronunciations using IPA notation
> 4. Content validation and quality checks
> 5. Batch import scripts for efficient content loading"

### Step 24: User Testing and Feedback

**AI Prompt for User Testing**:
> "Create a user testing plan including:
> 1. Beta user recruitment strategies
> 2. Feedback collection mechanisms
> 3. Usage analytics and error tracking
> 4. Performance monitoring for smart contract calls
> 5. Iterative improvement processes based on user feedback"

---

## Key Commands Reference

### Flow CLI Commands
```bash
# Basic Flow commands
flow version                          # Check Flow CLI version
flow init                            # Initialize Flow project
flow emulator start                  # Start local emulator
flow project deploy                  # Deploy contracts
flow transactions send              # Send transaction
flow scripts execute               # Execute script

# Dependency management (new in latest CLI)
flow dependencies install            # Install contract dependencies
flow dependencies discover          # Discover core contracts

# Development commands
flow cadence language-server        # Start Cadence language server
flow test                          # Run contract tests
flow events get                    # Get blockchain events

# Account management
flow keys generate                   # Generate key pairs
flow accounts create                # Create Flow account (testnet)
```

### NPM Commands
```bash
# Development commands
npm run dev                         # Start Next.js development server
npm run build                       # Build for production
npm run lint                        # Run ESLint
npm test                           # Run test suite

# Flow-specific
npm run flow:emulator              # Start Flow emulator
npm run flow:deploy                # Deploy contracts
npm run flow:test                  # Test contracts
```

---

## Troubleshooting Common Issues

### Contract Deployment Issues
- Ensure account has sufficient FLOW tokens for storage
- Check contract syntax with `flow cadence check`
- Verify import statements and contract addresses

### Frontend Integration Issues
- Confirm FCL configuration matches deployed contracts
- Check wallet connection and authorization
- Verify transaction signing and submission

### Performance Optimization
- Implement pagination for large datasets
- Cache frequently accessed data
- Optimize smart contract storage patterns

---

## Security Considerations

1. **Smart Contract Security**
   - Implement proper access controls
   - Validate all input parameters
   - Use capability-based permissions
   - Regular security audits

2. **Frontend Security**
   - Validate user inputs
   - Secure API endpoints
   - Implement rate limiting
   - Monitor for suspicious activity

3. **User Data Protection**
   - Minimize on-chain personal data
   - Implement proper error handling
   - Secure wallet integrations

---

## Resources and References

- [Flow Developer Portal](https://developers.flow.com/)
- [Cadence Language Reference](https://cadence-lang.org/)
- [FCL Documentation](https://developers.flow.com/tools/clients/fcl-js)
- [Flow Community Discord](https://discord.gg/flow)
- [Example Projects](https://github.com/onflow/flow-dev-examples)

---

This guide provides a comprehensive roadmap for implementing your Web3 Spaced Repetition Language Learning App on Flow. Each step includes specific commands and AI prompts to help you build the application systematically. 