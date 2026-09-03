# ChainVote

ChainVote is a full-stack Web3 decentralized voting application built on Ethereum.

Users can connect their MetaMask wallet, select a candidate and cast a vote through an on-chain transaction. Voting rules are enforced by a Solidity smart contract deployed on the Sepolia testnet, including protection against multiple votes from the same wallet.

**Live Demo:** https://chainvote-dapp.vercel.app/

**Smart Contract:** `0x3644F9d0897b5356053feEb4E98A866a1A5A7b98`

The project demonstrates practical integration between Solidity, Hardhat, React, TypeScript, Ethers.js and MetaMask.

## Overview

ChainVote was developed to demonstrate the integration between a Web3 frontend and an Ethereum smart contract.

Users connect their MetaMask wallet, select a candidate and submit a transaction to the blockchain. The smart contract validates the vote, prevents the same wallet from voting more than once and stores the results on-chain.

The frontend reads the current voting state directly from the deployed contract.

## Features

- MetaMask wallet connection
- Automatic Sepolia network switching
- Candidate data loaded directly from the blockchain
- On-chain voting
- One vote per wallet
- Duplicate-vote protection enforced by the smart contract
- Real-time vote count update after transaction confirmation
- Account and network change detection
- Sepolia testnet deployment
- Hardhat Ignition deployment workflow
- Automated smart contract tests
- Production-ready frontend build

## Tech Stack

### Smart Contract

- Solidity 0.8.34
- Hardhat 3
- Hardhat Ignition
- Mocha
- Ethers.js

### Frontend

- React
- TypeScript
- Vite
- Ethers.js
- MetaMask

### Blockchain

- Ethereum
- Sepolia Testnet

## Architecture

```text
User
  |
  v
React + TypeScript
  |
  v
Ethers.js
  |
  v
MetaMask
  |
  | signs transaction
  v
Ethereum Sepolia
  |
  v
ChainVote.sol
  |
  +-- Candidate data
  +-- Vote counts
  +-- Wallet voting status
```

The frontend uses Ethers.js to communicate with the smart contract.

Read operations retrieve candidate information and voting status directly from Sepolia. Write operations require the user to sign the transaction through MetaMask.

## Voting Flow

1. The user opens ChainVote.
2. The frontend connects to MetaMask.
3. MetaMask switches to the Sepolia network when necessary.
4. The application loads the candidates from the smart contract.
5. The user selects a candidate.
6. MetaMask requests transaction confirmation.
7. The vote is submitted to Sepolia.
8. The smart contract validates the wallet and candidate.
9. The vote is recorded on-chain.
10. The frontend reloads the results after confirmation.

## Voting Rules

The smart contract enforces the following rules:

- Each wallet can vote only once.
- A vote must reference a valid candidate.
- Vote counts are stored on-chain.
- Duplicate voting is rejected by the smart contract rather than only by the frontend.

This means that bypassing the user interface does not bypass the one-wallet-one-vote restriction.

## Sepolia Deployment

Network:

```text
Ethereum Sepolia
Chain ID: 11155111
```

ChainVote contract:

```text
0x3644F9d0897b5356053feEb4E98A866a1A5A7b98
```

The application currently interacts with this deployment.

## Project Structure

```text
chainvote-dapp/
|
|-- contracts/
|   `-- ChainVote.sol
|
|-- frontend/
|   |-- src/
|   |   |-- App.tsx
|   |   |-- contract.ts
|   |   |-- App.css
|   |   `-- main.tsx
|   |
|   `-- package.json
|
|-- ignition/
|   |-- modules/
|   |   `-- ChainVote.ts
|   |
|   `-- deployments/
|
|-- scripts/
|   `-- check-sepolia.ts
|
|-- test/
|
|-- hardhat.config.ts
|-- package.json
`-- README.md
```

## Running the Project Locally

### Requirements

Before running the project, install:

- Node.js
- npm
- MetaMask

Clone the repository and install the smart contract dependencies:

```bash
git clone https://github.com/lisarioss/chainvote-dapp.git
cd chainvote-dapp
npm install
```

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the local address displayed by Vite in your browser.

MetaMask is required to interact with the voting contract.

## Production Build

To verify the frontend production build:

```bash
cd frontend
npm run build
```

The build performs TypeScript validation and generates the optimized Vite production bundle.

## Smart Contract Tests

From the project root:

```bash
npx hardhat test
```

The test suite validates the behavior of the smart contract before deployment.

## Deploying with Hardhat Ignition

The deployment module is located at:

```text
ignition/modules/ChainVote.ts
```

For Sepolia deployment, the Hardhat configuration expects:

```text
SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY
```

Sensitive values should never be committed to the repository.

They can be stored using the Hardhat keystore:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

Deploy:

```bash
npx hardhat ignition deploy ignition/modules/ChainVote.ts --network sepolia
```

## Security Considerations

ChainVote is an educational portfolio project and should not be considered a production election system.

The current implementation demonstrates fundamental blockchain voting concepts, including transaction signing, wallet-based vote restriction and immutable on-chain vote storage.

A production-grade voting system would require additional mechanisms for identity verification, voter eligibility, privacy, governance, auditing and security review.

Private keys and RPC credentials must never be committed to source control.

## Current Status

The following milestones are complete:

- Smart contract implementation
- Automated contract tests
- Local Hardhat deployment
- React frontend
- MetaMask integration
- Multiple-wallet local testing
- Sepolia deployment
- Frontend integration with Sepolia
- Successful on-chain vote
- Production frontend build
- Public frontend deployment with Vercel

## Roadmap

Planned improvements include:

- Public frontend deployment
- Transaction links to a Sepolia block explorer
- Improved transaction feedback
- Voting result visualization
- Additional smart contract tests
- Contract verification
- Improved accessibility and responsive behavior
- Public frontend deployment

## Author

Lisa Rios

GitHub: https://github.com/lisarioss