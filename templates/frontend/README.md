# Abstract Frontend Template

Next.js starter with Abstract Global Wallet (AGW), wagmi, and viem pre-configured.

## Setup

```bash
npm install
```

## Configure your contract

Open `lib/contracts.ts` and set:
1. `CONTRACT_ADDRESS` — your deployed contract address
2. `CONTRACT_ABI` — copy from `artifacts-zk/contracts/YourContract.sol/YourContract.json`

## Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Switch to mainnet

In `app/providers.tsx`, change:
```ts
import { abstractTestnet } from "viem/chains";  // testnet
// to:
import { abstract } from "viem/chains";          // mainnet
```

## What's included

- `app/providers.tsx` — AGW + wagmi provider setup
- `app/page.tsx` — main page layout
- `components/ConnectButton.tsx` — login/logout with AGW
- `components/TokenInfo.tsx` — reads contract state (name, symbol, supply, balance)
- `components/MintButton.tsx` — writes to contract (mint function)
- `lib/contracts.ts` — your contract address + ABI (edit this)

## Adapting to your contract

Replace the ABI in `lib/contracts.ts` with your actual contract's ABI.
Replace the function calls in the components to match your contract's functions.

The agent can do this for you — just say:
> "Update the frontend to work with my NFT contract, here's the ABI: [paste ABI]"
