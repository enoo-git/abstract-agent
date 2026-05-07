import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { ethers } from "ethers";

// Staking configuration — edit these values
const REWARD_RATE = ethers.parseEther("0.01"); // 0.01 reward tokens per second (total pool)

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying to ${hre.network.name}...`);

  // 1. Deploy stake token
  const stakeArtifact = await deployer.loadArtifact("MockERC20");
  const stakeToken = await deployer.deploy(stakeArtifact, ["Stake Token", "STK"]);
  const stakeAddress = await stakeToken.getAddress();
  console.log(`StakeToken deployed at: ${stakeAddress}`);

  // 2. Deploy reward token
  const rewardToken = await deployer.deploy(stakeArtifact, ["Reward Token", "RWD"]);
  const rewardAddress = await rewardToken.getAddress();
  console.log(`RewardToken deployed at: ${rewardAddress}`);

  // 3. Deploy staking pool
  const poolArtifact = await deployer.loadArtifact("StakingPool");
  const pool = await deployer.deploy(poolArtifact, [stakeAddress, rewardAddress, REWARD_RATE]);
  const poolAddress = await pool.getAddress();
  console.log(`StakingPool deployed at: ${poolAddress}`);

  // 4. Mint initial supply
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  await stakeToken.mint(wallet.address, INITIAL_SUPPLY);
  await rewardToken.mint(wallet.address, INITIAL_SUPPLY);

  // 5. Fund pool with rewards (1 year worth)
  const REWARD_FUND = REWARD_RATE * BigInt(365 * 24 * 3600);
  await rewardToken.approve(poolAddress, REWARD_FUND);
  await pool.fundRewards(REWARD_FUND);
  console.log(`Pool funded with ${ethers.formatEther(REWARD_FUND)} RWD tokens`);

  console.log(`\nDone! Users can now stake STK tokens and earn RWD tokens.`);
  console.log(`\nTo verify:`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${poolAddress} "${stakeAddress}" "${rewardAddress}" "${REWARD_RATE}"`);
}
