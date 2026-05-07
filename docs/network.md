# Abstract Network — Complete Reference

## Testnet

| Parameter | Value |
|-----------|-------|
| Chain ID | `11124` |
| RPC URL | `https://api.testnet.abs.xyz` |
| Explorer | https://explorer.testnet.abs.xyz |
| Abscan | https://sepolia.abscan.org |
| L1 (Ethereum) | Sepolia |
| Native token | ETH |

## Mainnet

| Parameter | Value |
|-----------|-------|
| Chain ID | `2741` |
| RPC URL | `https://api.mainnet.abs.xyz` |
| Explorer | https://explorer.mainnet.abs.xyz |
| Abscan | https://abscan.org |
| L1 (Ethereum) | Ethereum mainnet |
| Native token | ETH |

## Add Abstract to MetaMask Manually

### Testnet
1. Open MetaMask → Networks → Add a network
2. Name: `Abstract Testnet`
3. RPC: `https://api.testnet.abs.xyz`
4. Chain ID: `11124`
5. Symbol: `ETH`
6. Explorer: `https://explorer.testnet.abs.xyz`

### Mainnet
Same as above with Chain ID `2741` and RPC `https://api.mainnet.abs.xyz`.

## Get Testnet ETH

1. **Sepolia faucet**: https://sepoliafaucet.com — get Sepolia ETH
2. **Bridge to Abstract Testnet**: https://portal.testnet.abs.xyz — bridge Sepolia ETH to Abstract

## Supported APIs

Abstract supports the standard Ethereum API (`eth_*`) plus ZKsync-specific methods (`zks_*`).

Available `eth_*` methods: `eth_call`, `eth_getBalance`, `eth_sendRawTransaction`, `eth_getTransactionReceipt`, `eth_blockNumber`, and 15+ more.

Available `zks_*` methods: `zks_estimateFee`, `zks_getProof`, `zks_getL2ToL1LogProof`, and 20+ more.
