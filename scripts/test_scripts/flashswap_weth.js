const { network, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { Contract, BigNumber, constants, utils } = require("ethers");
const { assert, util } = require("chai");
require("dotenv").config();
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");

const usualABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];

let tokenBorrowedAmount = ethers.utils.parseEther("1");
let tokenSentToContract = ethers.utils.parseEther("0.05");

let tokenBorrowedAddress = "";

async function main() {
  let RPC_URL, wallet, WETH, nonce1, deployer;
  // Get the accounts and chainId for local test
  const accounts = await ethers.getSigners();
  const chainId = network.config.chainId;
  const wethAddress = "";
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  if (chainId == 31337) {
    wallet = accounts[2];
    console.log("testnet Detected");
    flashswapContract = await ethers.getContract("flashswap", wallet);
    deployer = accounts[0];
  } else {
    console.log("Main Chain Detected");

    // deployer = accounts[0];
    RPC_URL = process.env.RPC_URL;
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    flashswapContract = await ethers.getContract("flashswapweth", wallet);
    WETH = new Contract(wethAddress, WETH9.abi, wallet);
    tokenContract = new Contract(wethAddress, usualABI, wallet);
  
  }

  // Send Section
  let nonce = await provider.getTransactionCount(wallet.address);

  const GWEI = BigNumber.from(1e9); // 10^9
  const calculateGasPrice = async (provider) => {
    const PRIORITY_GAS_PRICE = GWEI.mul(20); // miner bribe (+13 gwei per gas)
    const baseFee = (await provider.getBlock("latest")).baseFeePerGas; // base network fee (avg. gas price in wei)
    const gasPrice = PRIORITY_GAS_PRICE.add(baseFee || 0);
    console.log("gas price:", `${utils.formatUnits(gasPrice, "gwei")} gwei`);

    return gasPrice;
  };

  let gas = await calculateGasPrice(provider);

  /// APPROVAL SECTION ///
  // Approve flashswap for the token
  // Checking flashswap allowance
  const allowanceToken0 = await WETH.allowance(
    wallet.address,
    flashswapContract.address
  );

  if (allowanceToken0 < "1") {
    nonce1 = await provider.getTransactionCount(wallet.address);
    const approval0 = await WETH.approve(
      flashswapContract.address,
      constants.MaxUint256,
      {
        nonce: nonce1,
        gasLimit: 900000
      }
    );
    await approval0.wait().then(async (receipt) => {
      if (receipt && receipt.status == 1) {
        console.log("Token0 has been approved for flashswap usage!");
      } else {
      }
    });
  } else {
    console.log("Token0 already approved!");
  }
  nonce1 = await provider.getTransactionCount(wallet.address);

  let sendWETHtocontract = await tokenContract.transfer(
    flashswapContract.address,
    tokenSentToContract,
    {
      gasLimit: 90000
    }
  );

  await sendWETHtocontract.wait();
  let flashSwapDone = await flashswapContract.testFlashSwap(
    tokenBorrowedAddress,
    tokenBorrowedAmount,
    {
      gasLimit: 900000
    }
  );

  await flashSwapDone.wait(2);

  let withdraw = await flashswapContract.withdraw();

  await flashswapContract.withdrawWETH();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
