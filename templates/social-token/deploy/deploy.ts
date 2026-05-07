import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { ethers } from "ethers";

// Token configuration — edit these values
const TOKEN_NAME = "My Social Token";
const TOKEN_SYMBOL = "SOCIAL";
// Initial supply minted to the deployer (rest reserved for airdrop)
const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens to deployer

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const privateKey = vars.get("DEPLOYER_PRIVATE_KEY");
  const wallet = new Wallet(privateKey);
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying SocialToken to ${hre.network.name}...`);

  const artifact = await deployer.loadArtifact("SocialToken");
  const contract = await deployer.deploy(artifact, [
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY,
  ]);

  const address = await contract.getAddress();
  console.log(`SocialToken deployed at: ${address}`);
  console.log(`\nNext steps:`);
  console.log(`1. Verify: npx hardhat verify --network ${hre.network.name} ${address} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" "${INITIAL_SUPPLY}"`);
  console.log(`2. Set merkle root for airdrop: call setMerkleRoot(bytes32)`);
  console.log(`3. Enable airdrop: call toggleAirdrop()`);
}
