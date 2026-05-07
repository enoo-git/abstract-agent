import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

describe("MyNFT", function () {
  let nft: Contract;
  let owner: Wallet;
  let user: Wallet;

  const NAME = "My NFT Collection";
  const SYMBOL = "MNFT";
  const BASE_URI = "ipfs://QmTestCID/";
  const MINT_PRICE = ethers.parseEther("0.01");

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    user = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    nft = await deployContract("MyNFT", [NAME, SYMBOL, BASE_URI], {
      wallet: owner,
    });
  });

  describe("Deployment", function () {
    it("sets the correct name and symbol", async function () {
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
    });

    it("starts with sale inactive", async function () {
      expect(await nft.saleActive()).to.equal(false);
    });

    it("starts with zero supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);
    });
  });

  describe("Sale toggle", function () {
    it("owner can toggle sale", async function () {
      await nft.toggleSale();
      expect(await nft.saleActive()).to.equal(true);
      await nft.toggleSale();
      expect(await nft.saleActive()).to.equal(false);
    });

    it("non-owner cannot toggle sale", async function () {
      await expect(
        nft.connect(user).toggleSale()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await nft.toggleSale();
    });

    it("mints the correct number of tokens", async function () {
      await nft.connect(user).mint(2, { value: MINT_PRICE * 2n });
      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.balanceOf(user.address)).to.equal(2);
    });

    it("reverts with wrong ETH amount", async function () {
      await expect(
        nft.connect(user).mint(1, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Wrong ETH amount");
    });

    it("reverts when sale is inactive", async function () {
      await nft.toggleSale(); // turn off
      await expect(
        nft.connect(user).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Sale not active");
    });

    it("reverts when minting more than 10 at once", async function () {
      await expect(
        nft.connect(user).mint(11, { value: MINT_PRICE * 11n })
      ).to.be.revertedWith("Quantity must be 1-10");
    });

    it("owner can mint for free", async function () {
      await nft.ownerMint(user.address, 5);
      expect(await nft.balanceOf(user.address)).to.equal(5);
    });
  });

  describe("Token URI", function () {
    it("returns correct token URI", async function () {
      await nft.toggleSale();
      await nft.connect(user).mint(1, { value: MINT_PRICE });
      expect(await nft.tokenURI(0)).to.equal(`${BASE_URI}0`);
    });
  });

  describe("Withdraw", function () {
    it("owner can withdraw funds", async function () {
      await nft.toggleSale();
      await nft.connect(user).mint(1, { value: MINT_PRICE });

      const balanceBefore = await owner.provider!.getBalance(owner.address);
      await nft.withdraw();
      const balanceAfter = await owner.provider!.getBalance(owner.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("non-owner cannot withdraw", async function () {
      await expect(
        nft.connect(user).withdraw()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });
});
