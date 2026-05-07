# Abstract AI — Build your first dapp on Abstract

Never done Web3 before? No problem. This repo + the Claude agent guide you from zero to deployment.

## What is Abstract?

Abstract is an L2 blockchain (built on top of Ethereum) designed for mainstream crypto. It's:
- **Fast and cheap** (transactions in seconds, a few cents)
- **Ethereum-compatible** (reuse your Solidity knowledge)
- **Natively Account Abstraction** (wallets are smart contracts — no mandatory seed phrase)

## Quick Start

### 1. Prerequisites

- Node.js 18+ → https://nodejs.org
- A wallet (MetaMask or Abstract Global Wallet)
- Git

### 2. One-command setup

```bash
bash scripts/setup.sh
```

### 3. Pick your template

| I want to build... | Template |
|-------------------|----------|
| A staking dapp | `templates/staking/` |
| A DEX (token swap) | `templates/dex/` |
| A lending protocol | `templates/lending/` |
| An NFT collection | `templates/nft/` |
| An onchain mini-game | `templates/gaming/` |
| A token with airdrop/DAO | `templates/social-token/` |

### 4. Launch the agent

Open Claude Code in this folder and tell it what you want to build. The agent knows Abstract in depth.

```bash
claude
```

Example prompt:
> "I want to create a collection of 1000 NFTs with a 0.01 ETH mint price, metadata on IPFS. Guide me step by step."

## Repo Structure

```
abstract-ai/
├── CLAUDE.md              # Agent instructions (do not modify)
├── docs/
│   ├── network.md         # Chain IDs, RPCs, explorers
│   ├── account-abstraction.md
│   └── evm-differences.md
├── templates/
│   ├── staking/           # Staking pool (stake → earn rewards)
│   ├── dex/               # AMM DEX (constant product swap)
│   ├── lending/           # Lending pool (ETH collateral → borrow)
│   ├── nft/               # ERC-721 NFT collection
│   ├── gaming/            # Onchain mini-game / leaderboard
│   ├── social-token/      # ERC-20 + merkle airdrop
│   ├── erc20/             # Basic ERC-20 token
│   └── frontend/          # Next.js + AGW starter
└── scripts/
    └── setup.sh
```

## Resources

- [Abstract Documentation](https://docs.abs.xyz)
- [Testnet Explorer](https://explorer.testnet.abs.xyz)
- [Testnet ETH Faucet](https://portal.testnet.abs.xyz)
- [Abstract Discord](https://discord.gg/abstract)
