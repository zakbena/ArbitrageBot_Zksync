const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const entrancefee = ethers.utils.parseEther("0.01");
  const gasLane = networkConfig[chainId]["gasLane"];
  const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"];
  const interval = networkConfig[chainId]["interval"];

  let args = [];
  log("Deploying flashswap and waiting for confirmations...");
  const flashswap = await deploy("flashswap", {
    from: deployer,
    args: args, // Constructors parameters
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1
  });
  log(`flashswap deployed at ${flashswap.address}`);
};

module.exports.tags = ["all", "flashswap"];
