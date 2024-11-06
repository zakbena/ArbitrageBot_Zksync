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

  let args = [];
  log("Deploying flashswapweth and waiting for confirmations...");
  const flashswapweth = await deploy("flashswapweth", {
    from: deployer,
    args: args, // Constructors parameters
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1
  });
  log(`flashswapweth deployed at ${flashswapweth.address}`);
};

module.exports.tags = ["all", "flashswapweth"];
