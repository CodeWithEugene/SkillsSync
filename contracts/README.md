# SkillsRegistry (Base)

Solidity contract for on-chain skill attestations. One attestation (profile hash + timestamp) per address.

## Setup

```bash
forge install foundry-rs/forge-std
```

## Build & Test

```bash
forge build
forge test
```

## Deploy

**Option A – Deploy script (recommended)**

1. In project root `.env`, set:
   - `PRIVATE_KEY` or `DEPLOYER_PRIVATE_KEY` – deployer wallet private key (must have Base Sepolia ETH from [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet))
   - `ETHERSCAN_API_KEY` or `BASESCAN_API_KEY` – for contract verification on BaseScan (optional)
2. From repo root:
   ```bash
   node contracts/scripts/deploy.mjs
   ```
3. For Base Mainnet instead of Base Sepolia: `DEPLOY_CHAIN=base node contracts/scripts/deploy.mjs`
4. Copy the printed `NEXT_PUBLIC_SKILLS_REGISTRY_ADDRESS` into `.env` and set `NEXT_PUBLIC_BASE_CHAIN_ID=84532` (Sepolia) or `8453` (Mainnet).

**Option B – Forge directly**

```bash
cd contracts
export ETHERSCAN_API_KEY=your-basescan-api-key
forge create src/SkillsRegistry.sol:SkillsRegistry \
  --rpc-url https://sepolia.base.org \
  --private-key env:PRIVATE_KEY \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

Then set `NEXT_PUBLIC_SKILLS_REGISTRY_ADDRESS` in the app `.env` to the deployed address.
