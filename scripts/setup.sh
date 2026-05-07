#!/bin/bash
set -e

echo "=================================="
echo "  Abstract AI — Environment Setup"
echo "=================================="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install it from https://nodejs.org (v18 or higher required)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js v18+ required (current: $(node -v))"
  exit 1
fi

echo "Node.js: $(node -v) ✓"

# Pick a template
echo ""
echo "Which template do you want to use?"
echo "  1) ERC-20 Token"
echo "  2) NFT Collection"
echo "  3) Onchain Game / Leaderboard"
echo "  4) Social Token + Airdrop"
read -p "Enter number (1-4): " CHOICE

case $CHOICE in
  1) TEMPLATE="erc20" ;;
  2) TEMPLATE="nft" ;;
  3) TEMPLATE="gaming" ;;
  4) TEMPLATE="social-token" ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

DEST="${TEMPLATE}-project"
echo ""
echo "Creating project in ./$DEST ..."
cp -r "templates/$TEMPLATE" "$DEST"
cd "$DEST"

echo "Installing dependencies..."
npm install

echo ""
echo "Setting your deployer private key..."
echo "(This is the private key of the wallet you'll deploy from)"
echo "WARNING: Use a dedicated wallet for development — never your main wallet"
echo ""
npx hardhat vars set DEPLOYER_PRIVATE_KEY

echo ""
echo "=================================="
echo "Setup complete!"
echo ""
echo "Your project is in: ./$DEST"
echo ""
echo "Next steps:"
echo "  1. Get testnet ETH:"
echo "     - Sepolia faucet: https://sepoliafaucet.com"
echo "     - Bridge to Abstract: https://portal.testnet.abs.xyz"
echo ""
echo "  2. Edit the contract in contracts/"
echo ""
echo "  3. Compile:  npm run compile"
echo "  4. Deploy:   npm run deploy:testnet"
echo ""
echo "  5. View your contract:"
echo "     https://explorer.testnet.abs.xyz"
echo "=================================="
