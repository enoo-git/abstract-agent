import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Wallet } from "zksync-ethers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

describe("SocialToken", function () {
  let token: Contract;
  let owner: Wallet;
  let user1: Wallet;
  let user2: Wallet;
  let notWhitelisted: Wallet;

  let tree: StandardMerkleTree<string[]>;
  let merkleRoot: string;

  const NAME = "Social Token";
  const SYMBOL = "SOCIAL";
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const AIRDROP_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    user1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    user2 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);
    notWhitelisted = getWallet(LOCAL_RICH_WALLETS[3].privateKey);

    // Build merkle tree with user1 and user2 whitelisted
    tree = StandardMerkleTree.of(
      [[user1.address], [user2.address]],
      ["address"]
    );
    merkleRoot = tree.root;

    token = await deployContract("SocialToken", [NAME, SYMBOL, INITIAL_SUPPLY], {
      wallet: owner,
    });

    await token.setMerkleRoot(merkleRoot);
    await token.toggleAirdrop();
  });

  describe("Deployment", function () {
    it("mints initial supply to deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("sets correct name and symbol", async function () {
      expect(await token.name()).to.equal(NAME);
      expect(await token.symbol()).to.equal(SYMBOL);
    });
  });

  describe("Airdrop claim", function () {
    function getProof(address: string): string[] {
      for (const [i, v] of tree.entries()) {
        if (v[0] === address) return tree.getProof(i);
      }
      throw new Error("Address not in tree");
    }

    it("whitelisted user can claim", async function () {
      const proof = getProof(user1.address);
      await token.connect(user1).claimAirdrop(proof);
      expect(await token.balanceOf(user1.address)).to.equal(AIRDROP_AMOUNT);
    });

    it("cannot claim twice", async function () {
      const proof = getProof(user1.address);
      await token.connect(user1).claimAirdrop(proof);
      await expect(
        token.connect(user1).claimAirdrop(proof)
      ).to.be.revertedWith("Already claimed");
    });

    it("non-whitelisted user cannot claim", async function () {
      // Use user1's proof but from a different wallet
      const proof = getProof(user1.address);
      await expect(
        token.connect(notWhitelisted).claimAirdrop(proof)
      ).to.be.revertedWith("Not whitelisted");
    });

    it("reverts when airdrop is inactive", async function () {
      await token.toggleAirdrop(); // turn off
      const proof = getProof(user1.address);
      await expect(
        token.connect(user1).claimAirdrop(proof)
      ).to.be.revertedWith("Airdrop not active");
    });
  });

  describe("Owner airdrop", function () {
    it("owner can airdrop to multiple addresses", async function () {
      const recipients = [user1.address, user2.address];
      const amount = ethers.parseEther("50");
      await token.airdropTo(recipients, amount);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await token.balanceOf(user2.address)).to.equal(amount);
    });

    it("non-owner cannot airdrop", async function () {
      await expect(
        token.connect(user1).airdropTo([user2.address], ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Mint and burn", function () {
    it("owner can mint", async function () {
      const amount = ethers.parseEther("500");
      await token.mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("users can burn their tokens", async function () {
      const amount = ethers.parseEther("1000");
      await token.transfer(user1.address, amount);
      await token.connect(user1).burn(amount);
      expect(await token.balanceOf(user1.address)).to.equal(0);
    });
  });
});
