# Abstract Frontend — Next.js 15 + Tailwind 4 + shadcn/ui

Modern dapp frontend for Abstract Chain.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** (CSS-based config, no tailwind.config.ts)
- **shadcn/ui** components (Button, Card, Badge — copy-paste, no dependency)
- **Abstract Global Wallet** (AGW) — social login, no seed phrase
- **wagmi v2 + viem v2**

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect your contract

Edit `lib/contracts.ts`:

```ts
export const CONTRACT_ADDRESS = "0xYourDeployedAddress";
export const CONTRACT_ABI = [ /* your ABI here */ ];
```

Get the ABI after compiling your contract:
```
templates/your-contract/artifacts-zk/contracts/YourContract.sol/YourContract.json
```

## Deploy to production

```bash
npm run build
```

Then deploy to Vercel, Railway, or any Node.js host.
