import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const privateKey = vars.get("DEPLOYER_PRIVATE_KEY");
  const wallet = new Wallet(privateKey);
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying Leaderboard to ${hre.network.name}...`);

  const artifact = await deployer.loadArtifact("Leaderboard");
  const contract = await deployer.deploy(artifact, []);

  const address = await contract.getAddress();
  console.log(`Leaderboard deployed at: ${address}`);
  console.log(`\nNext steps:`);
  console.log(`1. Verify: npx hardhat verify --network ${hre.network.name} ${address}`);
  console.log(`2. Add operators: call addOperator(yourBackendWalletAddress)`);
}
