# Abstract/ZKsync vs Standard EVM Differences

Abstract uses the **ZKsync VM**, which is EVM-compatible but has important differences. This page lists the gotchas to avoid.

## Unsupported or Different Opcodes

| Opcode | Behavior on Abstract | Workaround |
|--------|---------------------|------------|
| `SELFDESTRUCT` | Not supported | Implement a `withdraw()` function + `paused` flag |
| `DIFFICULTY` / `PREVRANDAO` | Always returns `2500000000000000` | Don't use as randomness source |
| `BLOCKHASH` | Always returns `0` except for current block | Don't use for randomness |
| `CODECOPY` | Different behavior | Avoid in inline assembly |
| `EXTCODECOPY` | Different behavior | Avoid in inline assembly |

## Onchain Randomness

**On Abstract (like all L2s), onchain randomness is non-trivial.**

```solidity
// DANGEROUS — predictable
uint random = uint(blockhash(block.number - 1)) % 100;

// BETTER — use an oracle like Chainlink VRF
// See Chainlink docs for Abstract integration
```

## CREATE2 Address Calculation

CREATE2 address calculation on Abstract differs from Ethereum. Don't use the standard Ethereum formula.

```typescript
// CORRECT — use zksync-ethers
import { utils } from "zksync-ethers";

const address = utils.create2Address(
  deployerAddress,
  bytecodeHash,
  salt,
  constructorArgs
);
```

## Contract Deployment

Deployment goes through the `ContractDeployer` system contract. You **must** use `hre.deployer` or the `Deployer` class from `@matterlabs/hardhat-zksync`.

```typescript
// CORRECT
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";

const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));
const deployer = new Deployer(hre, wallet);
const artifact = await deployer.loadArtifact("MyContract");
const contract = await deployer.deploy(artifact, [arg1, arg2]);

// INCORRECT (don't use ethers.ContractFactory directly)
// const factory = new ethers.ContractFactory(abi, bytecode, signer);
```

## Solidity Libraries

Separately deployed libraries (`library` Solidity with public functions) must be deployed before the contract that uses them, with their address provided to the compiler.

To avoid complexity, **inline utility functions** or use libraries with only `internal` functions (no separate deployment needed).

```solidity
// Prefer internal libraries (no separate deployment)
library MathUtils {
    function percent(uint256 value, uint256 bps) internal pure returns (uint256) {
        return (value * bps) / 10000;
    }
}
```

## Gas

Gas calculation differs on Abstract (ZK proof cost included). Best practices:
- Let Hardhat auto-estimate gas
- Never hardcode `gasLimit`
- Gas may be higher than expected for storage-heavy operations

## `tx.origin`

`tx.origin` returns the transaction initiator. On Abstract with Account Abstraction, this may be the bootloader. **Never use `tx.origin` for security checks.**

## Nonces

Nonces are managed differently for smart contract wallets. If a transaction gets stuck, don't try to manually reset the nonce — wait for the timeout or ask in Discord.

## ABI Encoding

ABI encoding is identical to Ethereum. Tools like `ethers.js` and `viem` work without modification.
