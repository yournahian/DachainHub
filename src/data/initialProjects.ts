import { Project } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'DAC Swap',
    tagline: 'Vapor-fast AMM optimized for low-slippage DACT and DACC liquidity pools.',
    description: `### Overview
DAC Swap is the premier decentralized exchange (DEX) on the DAC Quantum Blockchain. It provides high-frequency liquidity pools and low-slippage swaps specifically optimized for the dual-token architecture (**DACT** and **DACC**).

### Features
- **Anti-MEV Architecture**: Transactions are shielded using DAC's block-level post-quantum encryption, preventing front-running and sandwich attacks.
- **Dynamic Fee Distribution**: A portion of DACC transaction fees is automatically distributed as rewards to liquidity providers and active supervisor nodes.
- **Instant Swaps**: Experience sub-second execution thanks to DAC's high-frequency transaction engine.

### Smart Contract Address (DACC)
\`0x9e25...8536d11f7\`

### Ticker / Governance
**DSWAP** (governance token for pool weights)`,
    category: 'DeFi',
    status: 'Live',
    logoUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?auto=format&fit=crop&w=120&h=120&q=80',
    bannerColor: 'linear-gradient(135deg, #aa3011 0%, #28426d 100%)',
    website: 'https://dacswap.example.com',
    github: 'https://github.com/dacblockchain/dac-swap',
    twitter: 'https://x.com/dac_swap',
    docs: 'https://docs.dacswap.example.com',
    team: ['Alistair Vance', 'Elena Rostova'],
    techStack: ['Solidity', 'Next.js', 'Ethers.js', 'Web3.js'],
    tags: ['DEX', 'AMM', 'Liquidity-Pools', 'Swap'],
    coverImageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=600&q=80',
    securityDetails: {
      auditStatus: 'Audit Completed',
      auditorName: 'Securify',
      securityLevel: 'High',
      pqcSafe: true
    },
    views: 1420,
    githubStars: 89,
    tokenTicker: 'DSWAP',
    contractAddress: '0xaa3011455f8b28426d3330303030303030303030',
    upvotes: 248,
    createdAt: '2026-05-10T12:00:00Z',
    builderId: 'dev_1',
    isFeatured: true,
    isApproved: true
  },
  {
    id: '2',
    name: 'Q-Shield Vault',
    tagline: 'Quantum-safe cryptographic vault for multi-sig custody and secrets.',
    description: `### Overview
Q-Shield Vault is an enterprise-grade multi-signature vault and secret manager designed specifically to withstand future quantum computer threats. It implements state-of-the-art post-quantum cryptographic (PQC) standards at the smart contract level.

### Technical Spec
- **Signature Schemes**: Integrates Crystals-Dilithium and Falcon signature validations.
- **Multi-Custodian Controls**: Configure custom N-of-M signature parameters for institutional treasury management.
- **Encrypted Metadata**: Store private keys, API configurations, and sensitive contract state in zero-knowledge encrypted storage nodes.

### Validator Integration
Requires active supervisor node validation before state changes are committed to the DAC ledger.`,
    category: 'Infrastructure',
    status: 'Live',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&h=120&q=80',
    bannerColor: 'linear-gradient(135deg, #28426d 0%, #11120c 100%)',
    website: 'https://qshield.example.com',
    github: 'https://github.com/dacblockchain/q-shield-vault',
    twitter: 'https://x.com/qshield_vault',
    docs: 'https://docs.qshield.example.com',
    team: ['Dr. Marcus Chen', 'Sarah Jenkins'],
    techStack: ['Rust', 'WebAssembly', 'Lattice-Cryptography'],
    tags: ['HSM', 'Custody', 'Multi-Sig', 'Secrets-Manager'],
    coverImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
    securityDetails: {
      auditStatus: 'Audit Completed',
      auditorName: 'Trail of Bits',
      securityLevel: 'High',
      pqcSafe: true
    },
    views: 942,
    githubStars: 145,
    tokenTicker: 'QSHIELD',
    contractAddress: '0x28426d455f8b11120c3330303030303030303030',
    upvotes: 189,
    createdAt: '2026-05-18T08:30:00Z',
    builderId: 'dev_2',
    isFeatured: true,
    isApproved: true
  },
  {
    id: '3',
    name: 'Quantum NFT Minter',
    tagline: 'Minter leveraging lattice cryptography to produce quantum-secure art.',
    description: `### Overview
Quantum NFT Minter (Q-NFT) is a decentralized application that allows creators to mint, trade, and showcase digital collectibles secured with next-generation cryptographic signatures.

### Why Q-NFT?
Standard NFTs minted on classical chains rely on ECDSA, which is theoretically vulnerable to Shor's algorithm. Q-NFT uses lattice-based signatures to lock ownership records.

### Features
- **Quantum Minting Engine**: Super-fast batch minting using optimized DACC execution fees.
- **Immersive Metadata**: Stored on decentralized tactical storage clusters verified by DAC Node Supervisors.
- **Cross-Chain Bridgeable**: Bridge your quantum-secure NFTs to other chains while maintaining cryptographic custody records.`,
    category: 'NFT',
    status: 'Beta',
    logoUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=120&h=120&q=80',
    bannerColor: 'linear-gradient(135deg, #e25836 0%, #ffcc00 100%)',
    website: 'https://qnft.example.com',
    github: 'https://github.com/dacblockchain/q-nft-minter',
    twitter: 'https://x.com/quantum_nft',
    docs: 'https://docs.qnft.example.com',
    team: ['Renata Cruz', 'Kenji Sato'],
    techStack: ['Solidity', 'Next.js', 'Falcon-Signatures', 'Canvas-API'],
    tags: ['NFT', 'Minter', 'Generative-Art', 'Post-Quantum'],
    coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    securityDetails: {
      auditStatus: 'Under Active Audit',
      auditorName: 'Halborn',
      securityLevel: 'Standard',
      pqcSafe: true
    },
    views: 562,
    githubStars: 42,
    tokenTicker: 'QNFT',
    contractAddress: '0xe25836455f8bffcc003330303030303030303030',
    upvotes: 112,
    createdAt: '2026-06-01T15:45:00Z',
    builderId: 'dev_3',
    isFeatured: false,
    isApproved: true
  },
  {
    id: '4',
    name: 'Nodes Grid Explorer',
    tagline: 'Real-time monitoring and rewards terminal for DAC validator nodes.',
    description: `### Overview
Nodes Grid Explorer is an open-source analytics platform providing visual transparency over the DAC Quantum Blockchain network topology. 

### Monitor Key Network Metrics
- **Node Distribution**: Real-time geolocation map of active Validator and Supervisor Nodes.
- **Staking Yields**: Calculate DACT staking APY based on node class, performance history, and current block rewards.
- **Health Indicators**: Tracks CPU performance, block heights, latency (ms), and network uptime statistics.

### Supervisor Interface
Allows supervisor nodes to trigger tactical network snapshots and audit contract states.`,
    category: 'Tooling',
    status: 'Live',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80',
    bannerColor: 'linear-gradient(135deg, #1b1d11 0%, #aa3011 100%)',
    website: 'https://nodes.dachain.tech',
    github: 'https://github.com/dacblockchain/nodes-grid-explorer',
    twitter: 'https://x.com/dac_chain',
    docs: 'https://docs.dachain.tech',
    team: ['Takahiro Nakamoto'],
    techStack: ['TypeScript', 'Svelte', 'Go', 'TailwindCSS'],
    tags: ['Analytics', 'Ecosystem-Map', 'Staking-Yield', 'Node-Monitor'],
    coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    securityDetails: {
      auditStatus: 'Self Audited // Open Source',
      securityLevel: 'Standard',
      pqcSafe: false
    },
    views: 2301,
    githubStars: 210,
    upvotes: 304,
    createdAt: '2026-04-20T10:15:00Z',
    builderId: 'dev_1',
    isFeatured: true,
    isApproved: true
  },
  {
    id: '5',
    name: 'DAC-Bridge Portal',
    tagline: 'Bi-directional transfer protocol between Ethereum and DAC Chain.',
    description: `### Overview
The DAC-Bridge Portal provides a fully decentralized, non-custodial bridge connecting the DAC Quantum Chain with EVM compatible networks (Ethereum mainnet, Arbitrum) and Solana.

### Mechanism
It utilizes a secure validator threshold scheme. When DACT (ERC-20) tokens are deposited on Ethereum, the smart contract registers a cryptographic event that triggers the minting of corresponding DACC/DACT assets on the DAC ledger.

### Audits
- **Audited by Securify (May 2026)**: Zero critical vulnerabilities detected.
- **Formal Verification**: Smart contract logic mathematically verified.`,
    category: 'Infrastructure',
    status: 'Testnet',
    logoUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=120&h=120&q=80',
    bannerColor: 'linear-gradient(135deg, #28426d 0%, #455f8b 100%)',
    website: 'https://bridge.dachain.tech',
    github: 'https://github.com/dacblockchain/dac-bridge',
    twitter: 'https://x.com/dac_chain',
    docs: 'https://docs.dachain.tech',
    team: ['Vikram Patel', 'Sonia Lagrange'],
    techStack: ['Rust', 'Solidity', 'Go', 'Web3.js'],
    tags: ['Bridge', 'Cross-Chain', 'EVM-Assets', 'Validator-Relay'],
    coverImageUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=600&q=80',
    securityDetails: {
      auditStatus: 'Audit Completed',
      auditorName: 'Securify',
      securityLevel: 'High',
      pqcSafe: true
    },
    views: 812,
    githubStars: 56,
    upvotes: 95,
    createdAt: '2026-06-05T18:00:00Z',
    builderId: 'dev_4',
    isFeatured: false,
    isApproved: true
  },
  {
    id: '6',
    name: 'Tactical DAO Hub',
    tagline: 'Interactive governance dashboard for node-based proposal voting.',
    description: `### Overview
Tactical DAO Hub is the official community coordination and governance portal. It enables validator and supervisor nodes to propose architectural upgrades, submit proposals, and cast votes.

### Voting Power Model
- **Weighted Consensus**: Staked DACT determines baseline voting weights.
- **Supervisor Boost**: Active supervisor nodes verify the alignment of proposals with the DAC Quantum Roadmap.
- **Execution Fee**: Creating proposals costs a fixed amount of DACC to prevent spam.`,
    category: 'Social',
    status: 'Concept',
    logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&h=120&q=80',
    bannerColor: 'linear-gradient(135deg, #11120c 0%, #e25836 100%)',
    website: 'https://dao.dachain.tech',
    github: 'https://github.com/dacblockchain/tactical-dao',
    twitter: 'https://x.com/dac_chain',
    docs: 'https://docs.dachain.tech',
    team: ['Alice Sterling', 'Bob Miller'],
    techStack: ['React', 'TypeScript', 'Ethers.js'],
    tags: ['DAO', 'Ecosystem-Governance', 'Voting-Weights', 'Node-Stake'],
    coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    securityDetails: {
      auditStatus: 'Community Reviewed',
      securityLevel: 'Experimental',
      pqcSafe: false
    },
    views: 439,
    githubStars: 34,
    upvotes: 67,
    createdAt: '2026-06-11T09:00:00Z',
    builderId: 'dev_5',
    isFeatured: false,
    isApproved: true
  }
];

export const INITIAL_COMMENTS = [
  {
    id: 'c1',
    projectId: '1',
    author: 'CryptoMax',
    text: 'Dac Swap has been amazing! Swapped my DACT to DACC in less than 500ms. Fees are practically non-existent!',
    rating: 5,
    timestamp: '2026-06-11T16:00:00Z'
  },
  {
    id: 'c2',
    projectId: '1',
    author: 'SolidityDev',
    text: 'UI looks neat and clean, but we need more liquidity pools. Waiting for DACC/USDC to go live.',
    rating: 4,
    timestamp: '2026-06-12T10:15:00Z'
  },
  {
    id: 'c3',
    projectId: '4',
    author: 'BlockWatcher',
    text: 'Essential tool for validator nodes. The reward calculator is super accurate. Props to Takahiro.',
    rating: 5,
    timestamp: '2026-06-10T14:30:00Z'
  },
  {
    id: 'c4',
    projectId: '2',
    author: 'InfoSecGuy',
    text: 'PQC (Post-Quantum Cryptography) implementation is very impressive. Dilithium signatures are the future of blockchain custody.',
    rating: 5,
    timestamp: '2026-06-08T09:00:00Z'
  }
];
