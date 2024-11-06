
# zkSync Arbitrage Bot Prototype on Maverick Protocol

This repository contains a prototype for an arbitrage bot designed to operate on the Maverick Protocol DEX within the zkSync Layer 2 network. The bot is capable of detecting arbitrage opportunities by interacting with various pools and executing flash swaps to capitalize on price discrepancies. The implementation includes deployment scripts, smart contracts, and helper scripts to facilitate data fetching and transaction automation.
Prototype made in early 2023.

## Overview

The bot leverages smart contracts on the Maverick Protocol and Uniswap DEX protocols to perform:
- **Flash Swaps**: Borrowing assets without upfront capital to facilitate quick trades.
- **Token Swaps**: Efficiently exchanging assets between tokens within liquidity pools.
- **Arbitrage Opportunities**: Identifying profitable trade paths between pools with price imbalances.

This project is configured to deploy and execute on the zkSync network, using JavaScript scripts for data management and Solidity smart contracts for interaction with the DEXs.

## Files and Structure

### Contracts (Solidity)

- **`arbitrage.sol`**: Main arbitrage contract that manages swaps between tokens, checking for profitable opportunities and facilitating arbitrage trades.
- **`flashswap.sol` and `flashswapweth.sol`**: Contracts for executing flash swaps, allowing the bot to borrow assets temporarily for arbitrage.
- **`Uniswap.sol` and `UniswapV2FlashSwap.sol`**: Interfaces and contract implementations for interacting with Uniswap V2, primarily used for fetching prices and executing trades on Uniswap.
- **`simpleswap_maverick.sol`**: Simplified contract for basic swap functions on Maverick Protocol, used by the bot as a utility for non-arbitrage swaps.

### JavaScript Scripts

- **Data Fetching**:
  - `fetch.js` and `fetch_and_Swap.js`: Scripts to fetch pool data from Maverick Protocol’s API. These scripts retrieve liquidity pool information and filter for pools with specific tokens, helping identify potential arbitrage opportunities.
  
- **Swap Execution**:
  - `arbitrage.js`: Main script for managing arbitrage operations. It executes swaps and flash loans using the Maverick Protocol and Uniswap V2 contracts.
  - `exactInput.js`, `exactInput_param.js`: Helper scripts for setting up exact input swaps on Maverick, calculating token amounts and handling slippage.

- **Flash Swap Management**:
  - `flashswap_weth.js` and `UniswapV2FlashSwap.js`: Scripts for executing flash swaps using WETH and other tokens, enabling the bot to trade with temporarily borrowed assets.

### Deployment Scripts

- **`01-deploy-flashswap.js` to `05-deploy-flashswapweth.js`**: Hardhat scripts for deploying the flash swap, arbitrage, and swap contracts on the zkSync network. Each script manages deployment parameters and verifies contracts on-chain.

## Installation

### Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **Hardhat**: Hardhat is used as the development environment for deploying and testing contracts.
- **zkSync Setup**: zkSync requires specific setup for Layer 2 deployment. Please ensure your environment is correctly configured.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/arbitrage-bot-zksync.git
   cd arbitrage-bot-zksync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` file to `.env` and update it with the necessary keys.
   ```bash
   cp .env.example .env
   ```
   - `RPC_URL`: RPC URL for the zkSync network.
   - `PRIVATE_KEY`: Private key for the deploying account.
   - `ADDRESS_ROUTER`: Address of the router for Maverick or Uniswap DEX.

4. **Compile contracts**:
   ```bash
   npx hardhat compile
   ```

## Deployment

To deploy the contracts on zkSync, use the Hardhat scripts provided.

1. **Deploy Flash Swap**:
   ```bash
   npx hardhat run scripts/01-deploy-flashswap.js --network zksync
   ```

2. **Deploy Uniswap V2 Flash Swap**:
   ```bash
   npx hardhat run scripts/02-deploy-UniswapV2FlashSwap-2.js --network zksync
   ```

3. Continue similarly for other deployment scripts as needed.

## Usage

### Running the Arbitrage Bot

1. **Fetch Data**:
   Use `fetch.js` or `fetch_and_Swap.js` to gather pool data.
   ```bash
   node scripts/fetch.js
   ```

2. **Execute Arbitrage**:
   Run `arbitrage.js` to perform swaps and arbitrage between identified pools.
   ```bash
   node scripts/arbitrage.js
   ```

3. **Monitor Transactions**:
   Logs provide details on execution times, pool information, and swap outcomes.

## Notes

- **Gas Management**: Ensure sufficient balance for gas fees, particularly for flash swaps and arbitrage transactions, which can incur high fees.
- **Slippage and Liquidity**: Check for pool liquidity to avoid slippage losses.
- **Risk Management**: This prototype is for testing and research purposes; real-world application in mainnet environments carries risks.

## License

MIT License. See `LICENSE` file for more details.
