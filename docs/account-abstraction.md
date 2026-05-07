# Native Account Abstraction on Abstract

## What is Account Abstraction?

On standard Ethereum, there are two account types:
- **EOA** (Externally Owned Account): your MetaMask wallet, controlled by a private key
- **Smart Contract**: deployed code on the blockchain

The problem: EOAs are limited. No recovery if you lose your key, can't pay gas in ERC-20 tokens, no automated transactions.

**On Abstract, ALL accounts are smart contracts.** Even when you connect MetaMask, Abstract treats it internally as a `DefaultAccount`. This is native Account Abstraction.

## What This Changes for Your Dapps

### 1. Paymasters — Gas Without ETH

A **paymaster** is a contract that pays gas on behalf of users. You can:
- **Sponsor gas**: your users pay nothing (you absorb the fees)
- **Accept ERC-20 as gas**: the user pays in USDC, for example

```typescript
// Example: transaction with a paymaster (sponsorship)
import { utils } from "zksync-ethers";

const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
  type: "General",
  innerInput: new Uint8Array(),
});

const tx = await contract.myFunction(args, {
  customData: {
    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
    paymasterParams,
  },
});
```

### 2. Session Keys — Transactions Without Popups

Session keys allow granting a temporary permission to a key to sign transactions without user confirmation each time. Perfect for:
- Games (frequent actions)
- Subscriptions
- Trading bots

### 3. Account Recovery

Because accounts are contracts, you can implement your own recovery logic (multi-sig, time delay, trusted contacts, etc.).

## Implications for Your Smart Contracts

### NEVER use `tx.origin` for security

```solidity
// DANGEROUS on Abstract
function transfer() public {
    require(tx.origin == owner, "Not authorized"); // Wrong!
}

// CORRECT
function transfer() public {
    require(msg.sender == owner, "Not authorized"); // OK
}
```

### `msg.sender` During Deployment

During contract deployment, `msg.sender` in the constructor is the deploying account address (same as Ethereum), but deployment goes through the `ContractDeployer` system contract internally.

## Abstract Global Wallet (AGW)

The native wallet designed for Abstract. Supports:
- Social login (email, Google, Apple)
- No seed phrase required
- Built-in session keys
- Native paymasters

### React Integration

```bash
npm install @abstract-foundation/agw-react wagmi viem
```

```tsx
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { useAbstractClient, useLoginWithAbstract } from "@abstract-foundation/agw-react";

// Wrap your app root
function Providers({ children }) {
  return (
    <AbstractWalletProvider chain={abstractTestnet}>
      {children}
    </AbstractWalletProvider>
  );
}

// In a component
function ConnectButton() {
  const { login, logout } = useLoginWithAbstract();
  const { data: client } = useAbstractClient();

  return client
    ? <button onClick={logout}>Disconnect</button>
    : <button onClick={login}>Connect with Abstract</button>;
}
```

## Resources

- [Abstract Account Abstraction Docs](https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview)
- [Abstract Global Wallet](https://docs.abs.xyz/abstract-global-wallet/overview)
