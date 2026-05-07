import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

describe("MyToken", function () {
  let token: Contract;
  let owner: Wallet;
  let user: Wallet;

  const NAME = "My Token";
  const SYMBOL = "MTK";
  const INITIAL_SUPPLY = ethers.parseEther("100000");

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    user = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    token = await deployContract("MyToken", [NAME, SYMBOL, INITIAL_SUPPLY], {
      wallet: owner,
    });
  });

  describe("Deployment", function () {
    it("sets the correct name and symbol", async function () {
      expect(await token.name()).to.equal(NAME);
      expect(await token.symbol()).to.equal(SYMBOL);
    });

    it("mints initial supply to the deployer", async function () {
      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(INITIAL_SUPPLY);
    });

    it("sets the correct owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("owner can mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.mint(user.address, mintAmount);
      expect(await token.balanceOf(user.address)).to.equal(mintAmount);
    });

    it("non-owner cannot mint", async function () {
      const tokenAsUser = token.connect(user);
      await expect(
        tokenAsUser.mint(user.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("cannot mint beyond MAX_SUPPLY", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      const remaining = maxSupply - (await token.totalSupply());
      await expect(
        token.mint(user.address, remaining + 1n)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Burning", function () {
    it("users can burn their own tokens", async function () {
      const amount = ethers.parseEther("1000");
      await token.transfer(user.address, amount);

      const tokenAsUser = token.connect(user);
      await tokenAsUser.burn(amount);

      expect(await token.balanceOf(user.address)).to.equal(0);
    });
  });

  describe("Transfers", function () {
    it("transfers tokens between accounts", async function () {
      const amount = ethers.parseEther("500");
      await token.transfer(user.address, amount);
      expect(await token.balanceOf(user.address)).to.equal(amount);
    });

    it("fails if sender has insufficient balance", async function () {
      await expect(
        token.connect(user).transfer(owner.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });
});
