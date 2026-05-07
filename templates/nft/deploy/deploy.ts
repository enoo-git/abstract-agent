import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";

// NFT configuration — edit these values
const NFT_NAME = "My NFT Collection";
const NFT_SYMBOL = "MNFT";
// Replace with your IPFS CID after uploading metadata
// Example: "ipfs://QmYourCIDHere/"
const BASE_URI = "ipfs://QmYourCIDHere/";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const privateKey = vars.get("DEPLOYER_PRIVATE_KEY");
  const wallet = new Wallet(privateKey);
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying MyNFT to ${hre.network.name}...`);
  console.log(`Deployer address: ${wallet.address}`);

  const artifact = await deployer.loadArtifact("MyNFT");
  const contract = await deployer.deploy(artifact, [NFT_NAME, NFT_SYMBOL, BASE_URI]);

  const address = await contract.getAddress();
  console.log(`MyNFT deployed at: ${address}`);
  console.log(`\nNext steps:`);
  console.log(`1. Verify: npx hardhat verify --network ${hre.network.name} ${address} "${NFT_NAME}" "${NFT_SYMBOL}" "${BASE_URI}"`);
  console.log(`2. Enable sale: call toggleSale() on the contract`);
}
