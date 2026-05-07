import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { ethers } from "ethers";

// Token configuration — edit these values
const TOKEN_NAME = "My Token";
const TOKEN_SYMBOL = "MTK";
const INITIAL_SUPPLY = ethers.parseEther("100000"); // 100,000 tokens

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const privateKey = vars.get("DEPLOYER_PRIVATE_KEY");
  const wallet = new Wallet(privateKey);
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying MyToken to ${hre.network.name}...`);
  console.log(`Deployer address: ${wallet.address}`);

  const artifact = await deployer.loadArtifact("MyToken");
  const contract = await deployer.deploy(artifact, [
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY,
  ]);

  const address = await contract.getAddress();
  console.log(`MyToken deployed at: ${address}`);
  console.log(`\nTo verify:`);
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${address} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" "${INITIAL_SUPPLY}"`
  );
}
