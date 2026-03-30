# VaultPay

**Decentralized escrow payments — trust-as-a-service on Base & Arbitrum.**

Non-custodial escrow smart contracts with built-in dispute resolution. Buy, sell, and trade anything — trustlessly.

## Architecture

```
VaultPay/
├── contracts/          # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── VaultPayEscrow.sol    # Core escrow logic
│   │   ├── interfaces/IERC20.sol
│   │   └── utils/ReentrancyGuard.sol
│   ├── test/           # Foundry tests (25+ test cases)
│   └── script/         # Deployment scripts
└── frontend/           # Next.js 14 + TailwindCSS
    ├── app/            # App Router pages
    │   ├── page.tsx          # Landing page
    │   ├── dashboard/        # Deal management
    │   └── deal/[id]/        # Individual deal view
    ├── components/     # Reusable UI components
    └── lib/            # Contracts ABI, wagmi config, utils
```

## Smart Contract

Single contract (~250 lines) handling the full escrow lifecycle:

```
CREATED → FUNDED → DELIVERED → RELEASED
                       ↓
                   DISPUTED → RESOLVED (split) | REFUNDED
```

### Features
- **ETH + ERC-20** support (USDC, USDT, DAI)
- **0.5% protocol fee** (only on successful release)
- **Auto-refund** after 14-day timeout if seller ghosts
- **Dispute resolution** with proportional split (not all-or-nothing)
- **3-day dispute window** after delivery confirmation
- **Reentrancy protected**, minimal attack surface
- **No proxy pattern** — immutable, auditable

## Frontend

- **Next.js 14** with App Router
- **TailwindCSS** dark-first design
- **RainbowKit + wagmi** wallet connection
- **Base & Arbitrum** chain support

## Getting Started

### Contracts

```bash
cd contracts
forge install
forge test -vvv
forge build
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Add WalletConnect project ID
npm run dev
```

## Deployment

```bash
cd contracts
source .env
forge script script/Deploy.s.sol --rpc-url $BASE_RPC --broadcast --verify
```

## License

MIT
