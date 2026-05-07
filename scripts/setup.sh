#!/bin/bash
set -e

echo "=================================="
echo "  Abstract AI — Environment Setup"
echo "=================================="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install it from https://nodejs.org (v22 recommended)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js v18+ required (current: $(node -v))"
  exit 1
fi

if [ "$NODE_VERSION" -ge 24 ]; then
  echo "WARNING: Node.js v24+ has a known issue with the zksolc compiler download."
  echo "         Recommended: switch to Node.js v22 (e.g. via nvm: nvm use 22)"
  echo ""
fi

echo "Node.js: $(node -v) ✓"

# Pick a template
echo ""
echo "Which template do you want to use?"
echo ""
echo "  --- DeFi ---"
echo "  1) Staking Pool         (stake tokens, earn rewards)"
echo "  2) DEX / AMM            (token swaps, liquidity pools)"
echo "  3) Lending Protocol     (collateral, borrow, liquidate)"
echo ""
echo "  --- NFT & Gaming ---"
echo "  4) NFT Collection       (mint, sale, metadata)"
echo "  5) Onchain Game         (scores, leaderboard)"
echo ""
echo "  --- Tokens ---"
echo "  6) ERC-20 Token         (basic fungible token)"
echo "  7) Social Token         (token + merkle airdrop)"
echo ""
read -p "Enter number (1-7): " CHOICE

case $CHOICE in
  1) TEMPLATE="staking" ;;
  2) TEMPLATE="dex" ;;
  3) TEMPLATE="lending" ;;
  4) TEMPLATE="nft" ;;
  5) TEMPLATE="gaming" ;;
  6) TEMPLATE="erc20" ;;
  7) TEMPLATE="social-token" ;;
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
echo "  3. Run tests (requires local node):"
echo "     npx hardhat node-zksync --port 8011 &"
echo "     npx hardhat test --network inMemoryNode"
echo ""
echo "  4. Compile:  npm run compile"
echo "  5. Deploy:   npm run deploy:testnet"
echo ""
echo "  6. View your contract:"
echo "     https://explorer.testnet.abs.xyz"
echo "=================================="
