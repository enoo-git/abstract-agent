import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { ethers } from "ethers";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying DEX to ${hre.network.name}...`);

  // 1. Deploy two tokens
  const tokenArtifact = await deployer.loadArtifact("MockERC20");
  const tokenA = await deployer.deploy(tokenArtifact, ["Token A", "TKNA"]);
  const tokenB = await deployer.deploy(tokenArtifact, ["Token B", "TKNB"]);
  const addrA = await tokenA.getAddress();
  const addrB = await tokenB.getAddress();
  console.log(`TokenA: ${addrA}`);
  console.log(`TokenB: ${addrB}`);

  // 2. Deploy AMM
  const ammArtifact = await deployer.loadArtifact("SimpleAMM");
  const amm = await deployer.deploy(ammArtifact, [addrA, addrB]);
  const ammAddress = await amm.getAddress();
  console.log(`SimpleAMM deployed at: ${ammAddress}`);

  // 3. Mint tokens and seed initial liquidity
  const MINT = ethers.parseEther("100000");
  await tokenA.mint(wallet.address, MINT);
  await tokenB.mint(wallet.address, MINT);

  const SEED_A = ethers.parseEther("10000");
  const SEED_B = ethers.parseEther("10000");
  await tokenA.approve(ammAddress, SEED_A);
  await tokenB.approve(ammAddress, SEED_B);
  await amm.addLiquidity(SEED_A, SEED_B, 0);
  console.log(`Initial liquidity seeded: 10,000 TKNA / 10,000 TKNB`);

  console.log(`\nTo verify:`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${ammAddress} "${addrA}" "${addrB}"`);
}
