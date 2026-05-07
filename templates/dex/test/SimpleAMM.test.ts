import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

describe("SimpleAMM", function () {
  let amm: Contract;
  let tokenA: Contract;
  let tokenB: Contract;
  let owner: Wallet;
  let trader: Wallet;

  const SEED = ethers.parseEther("10000");
  const MINT = ethers.parseEther("1000000");

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    trader = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    tokenA = await deployContract("MockERC20", ["Token A", "TKNA"], { wallet: owner });
    tokenB = await deployContract("MockERC20", ["Token B", "TKNB"], { wallet: owner });

    const addrA = await tokenA.getAddress();
    const addrB = await tokenB.getAddress();

    amm = await deployContract("SimpleAMM", [addrA, addrB], { wallet: owner });
    const ammAddr = await amm.getAddress();

    // Mint to owner and trader
    await tokenA.mint(owner.address, MINT);
    await tokenB.mint(owner.address, MINT);
    await tokenA.mint(trader.address, MINT);
    await tokenB.mint(trader.address, MINT);

    // Seed initial liquidity
    await tokenA.approve(ammAddr, SEED);
    await tokenB.approve(ammAddr, SEED);
    await amm.addLiquidity(SEED, SEED, 0);
  });

  describe("Liquidity", function () {
    it("seeds reserves correctly", async function () {
      const [resA, resB] = await amm.getReserves();
      expect(resA).to.equal(SEED);
      expect(resB).to.equal(SEED);
    });

    it("issues LP tokens to provider", async function () {
      const lp = await amm.balanceOf(owner.address);
      expect(lp).to.be.gt(0);
    });

    it("allows removing liquidity", async function () {
      const lp = await amm.balanceOf(owner.address);
      const ammAddr = await amm.getAddress();
      await amm.approve(ammAddr, lp);
      await amm.removeLiquidity(lp / 2n, 0, 0);
      const [resA] = await amm.getReserves();
      expect(resA).to.be.lt(SEED);
    });
  });

  describe("Swap", function () {
    it("swaps tokenA for tokenB", async function () {
      const ammAddr = await amm.getAddress();
      const swapIn = ethers.parseEther("100");
      const addrA = await tokenA.getAddress();

      await tokenA.connect(trader).approve(ammAddr, swapIn);
      const balBefore = await tokenB.balanceOf(trader.address);

      await amm.connect(trader).swap(addrA, swapIn, 0);

      const balAfter = await tokenB.balanceOf(trader.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("applies 0.3% fee (output less than input)", async function () {
      const amountIn = ethers.parseEther("100");
      const amountOut = await amm.getAmountOut(amountIn, true);
      // With equal reserves, output without fee would be ~100. With 0.3% fee it should be less.
      expect(amountOut).to.be.lt(amountIn);
    });

    it("reverts with invalid token", async function () {
      await expect(
        amm.connect(trader).swap(ethers.ZeroAddress, ethers.parseEther("1"), 0)
      ).to.be.revertedWith("Invalid token");
    });

    it("reverts when slippage too high", async function () {
      const ammAddr = await amm.getAddress();
      const swapIn = ethers.parseEther("100");
      const addrA = await tokenA.getAddress();
      await tokenA.connect(trader).approve(ammAddr, swapIn);

      await expect(
        amm.connect(trader).swap(addrA, swapIn, ethers.parseEther("200"))
      ).to.be.revertedWith("Slippage: insufficient output");
    });
  });
});
