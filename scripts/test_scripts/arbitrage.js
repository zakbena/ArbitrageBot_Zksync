const { network, ethers } = require("hardhat");
const { Contract, BigNumber, constants, utils } = require("ethers");
const routerArtifact = require("@maverick/maverick-v1/abi/IRouter.json");
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
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

let amountFlashSwapNumber = 0.1;
let toRepay = (amountFlashSwapNumber * 0.3) / 100;
console.log(toRepay);
let amountflashswap = ethers.utils.parseEther(`${amountFlashSwapNumber}`);
const exactInput = "0.1";
const wethsent = utils.parseEther(`${toRepay}`);
// Amount of entrant tokens
const amountIn = utils.parseEther(exactInput);

// Minimum amount (Slippeage included)
const amoutOutMin = utils.parseEther("0");

// Address tokenOut
const tokenOut = "";

const exactInputOut = "0.00001";
const amountOut = ethers.utils.parseEther(exactInputOut);

async function swapEthForTokens() {
  let RPC_URL, wallet, router, WETH, nonce1;
  // Get the accounts and chainId for local test
  const accounts = await ethers.getSigners();
  const chainId = network.config.chainId;
  const wethAddress = "";

  const routerAddress = process.env.ADDRESS_ROUTER;
  RPC_URL = process.env.RPC_URL;
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  router = await ethers.getContract("arbitrage", wallet);
  WETH = new Contract(wethAddress, WETH9.abi, wallet);
  tokenContract = new Contract(tokenOut, usualABI, wallet);

  nonce1 = await provider.getTransactionCount(wallet.address);

  // Checking router allowance
  const allowanceToken0 = await tokenContract.allowance(
    wallet.address,
    router.address
  );

  if (allowanceToken0 < "1") {
    nonce1 = await provider.getTransactionCount(wallet.address);
    const approval0 = await tokenContract.approve(
      router.address,
      constants.MaxUint256,
      { nonce: nonce1, gasLimit: 900000 }
    );
    await approval0.wait().then(async (receipt) => {
      if (receipt && receipt.status == 1) {
        console.log("Token0 has been approved for router usage!");
      } else {
      }
    });
  } else {
    console.log("Token0 already approved!");
  }

  /// SWAP SECTION ///

  // PLEASE NOTE THAT THIS SCRIPT DOES NOT TAKE IN ACCOUNT THE RESERVE OF THE TOKENS
  nonce1 = await provider.getTransactionCount(wallet.address);

  let balanceOfWethContract = await WETH.balanceOf(router.address);

  if (balanceOfWethContract.toString() < ethers.utils.parseEther("0.0001")) {
    let sendWETHtocontract = await WETH.transfer(router.address, wethsent, {
      gasLimit: 90000,
      nonce: nonce1
    });

    await sendWETHtocontract.wait(2).then(async (receipt) => {
      if (receipt && receipt.status == 1) {
        console.log("WETH transfered to Contract!");
      } else {
      }
    });
  } else {
    console.log("Enough WETH on contract");
  }

  nonce1 = await provider.getTransactionCount(wallet.address);

  // Address token In
  const tokenIn = WETH.address;
  // Tx deadline
  const deadline = Math.floor(Date.now() / 1000 + 20 * 60);

  console.log(amountOut);
  let poolid = "";

  let path = ethers.utils.solidityPack(
    ["address", "address", "address"],
    [tokenIn, poolid, tokenOut]
  );

  let poolidSell = "";

  let pathSell = ethers.utils.solidityPack(
    ["address", "address", "address"],
    [tokenOut, poolidSell, tokenIn]
  );
  // path = [tokenIn, tokenOut];
  const dataTuple = [path, router.address, deadline, amountIn, amoutOutMin];
  const dataTupleOut = [
    pathSell,
    router.address,
    deadline,
    amountOut,
    amoutOutMin
  ];

  let tokenBorrowed = "";

  const swap = await router.flashSwap(
    tokenBorrowed,
    amountflashswap,
    dataTuple,
    dataTupleOut,
    tokenOut,
    {
      nonce: nonce1
    }
  );

  await swap.wait().then(async (receipt) => {
    if (receipt && receipt.status == 1) {
      console.log("Abitrage has been made!");
    } else {
    }
  });
  nonce1 = await provider.getTransactionCount(wallet.address);

  let withdrawTx = await router.withdrawWETH({ nonce: nonce1 });

  await withdrawTx.wait().then(async (receipt) => {
    if (receipt && receipt.status == 1) {
      console.log("WETH withdrawed!");
    } else {
    }
  });
  console.log("Script Ended!");
}

swapEthForTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = {
  swapEthForTokens
};
