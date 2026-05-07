import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { ethers } from "ethers";

// Price: 1 ETH = 2000 loan tokens (e.g. 2000 USDC)
const ETH_PRICE = ethers.parseEther("2000");

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying LendingPool to ${hre.network.name}...`);

  // 1. Deploy mock loan token (simulates USDC)
  const tokenArtifact = await deployer.loadArtifact("MockERC20");
  const loanToken = await deployer.deploy(tokenArtifact, ["Mock USDC", "mUSDC"]);
  const loanAddress = await loanToken.getAddress();
  console.log(`MockUSDC deployed at: ${loanAddress}`);

  // 2. Deploy lending pool
  const poolArtifact = await deployer.loadArtifact("LendingPool");
  const pool = await deployer.deploy(poolArtifact, [loanAddress, ETH_PRICE]);
  const poolAddress = await pool.getAddress();
  console.log(`LendingPool deployed at: ${poolAddress}`);

  // 3. Mint and deposit initial liquidity
  const LIQUIDITY = ethers.parseEther("100000"); // 100,000 mUSDC
  await loanToken.mint(wallet.address, LIQUIDITY);
  await loanToken.approve(poolAddress, LIQUIDITY);
  await pool.deposit(LIQUIDITY);
  console.log(`Pool seeded with 100,000 mUSDC`);

  console.log(`\nTo verify:`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${poolAddress} "${loanAddress}" "${ETH_PRICE}"`);
}
