import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

describe("LendingPool", function () {
  let pool: Contract;
  let loanToken: Contract;
  let owner: Wallet;
  let lender: Wallet;
  let borrower: Wallet;

  // 1 ETH = 2000 loan tokens
  const ETH_PRICE = ethers.parseEther("2000");
  const POOL_LIQUIDITY = ethers.parseEther("100000");

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    lender = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    borrower = getWallet(LOCAL_RICH_WALLETS[2].privateKey);

    loanToken = await deployContract("MockERC20", ["Mock USDC", "mUSDC"], { wallet: owner });
    const loanAddr = await loanToken.getAddress();

    pool = await deployContract("LendingPool", [loanAddr, ETH_PRICE], { wallet: owner });
    const poolAddr = await pool.getAddress();

    // Fund lender and seed pool
    await loanToken.mint(lender.address, POOL_LIQUIDITY);
    await loanToken.connect(lender).approve(poolAddr, POOL_LIQUIDITY);
    await pool.connect(lender).deposit(POOL_LIQUIDITY);

    // Give borrower some loan tokens for repayment
    await loanToken.mint(borrower.address, ethers.parseEther("10000"));
  });

  describe("Deposits", function () {
    it("lender deposit is recorded", async function () {
      expect(await pool.deposits(lender.address)).to.equal(POOL_LIQUIDITY);
    });

    it("lender can withdraw deposit", async function () {
      const poolAddr = await pool.getAddress();
      const withdrawAmt = ethers.parseEther("1000");
      await pool.connect(lender).withdrawDeposit(withdrawAmt);
      expect(await pool.deposits(lender.address)).to.equal(POOL_LIQUIDITY - withdrawAmt);
    });
  });

  describe("Borrowing", function () {
    it("borrower can deposit collateral and borrow", async function () {
      const poolAddr = await pool.getAddress();
      // 1 ETH collateral = $2000 → can borrow up to $1333 (150% ratio)
      const borrowAmt = ethers.parseEther("1000");

      await pool.connect(borrower).depositCollateral({ value: ethers.parseEther("1") });
      await pool.connect(borrower).borrow(borrowAmt);

      const pos = await pool.positions(borrower.address);
      expect(pos.borrowed).to.equal(borrowAmt);
    });

    it("reverts with insufficient collateral", async function () {
      // 0.1 ETH = $200, can't borrow $1000 (need $1500)
      await pool.connect(borrower).depositCollateral({ value: ethers.parseEther("0.1") });
      await expect(
        pool.connect(borrower).borrow(ethers.parseEther("1000"))
      ).to.be.revertedWith("Insufficient collateral");
    });
  });

  describe("Repayment", function () {
    it("borrower can repay and get collateral back", async function () {
      const poolAddr = await pool.getAddress();
      const borrowAmt = ethers.parseEther("1000");

      await pool.connect(borrower).depositCollateral({ value: ethers.parseEther("1") });
      await pool.connect(borrower).borrow(borrowAmt);

      // Approve repayment (principal + some buffer for interest)
      const buffer = ethers.parseEther("100");
      await loanToken.connect(borrower).approve(poolAddr, borrowAmt + buffer);

      const ethBefore = await borrower.provider!.getBalance(borrower.address);
      await pool.connect(borrower).repay();
      const ethAfter = await borrower.provider!.getBalance(borrower.address);

      expect(ethAfter).to.be.gt(ethBefore); // got collateral back

      const pos = await pool.positions(borrower.address);
      expect(pos.borrowed).to.equal(0);
    });
  });

  describe("Collateral ratio", function () {
    it("returns max ratio with no debt", async function () {
      const ratio = await pool.getCollateralRatio(borrower.address);
      expect(ratio).to.equal(ethers.MaxUint256);
    });

    it("returns correct ratio with debt", async function () {
      await pool.connect(borrower).depositCollateral({ value: ethers.parseEther("1") });
      await pool.connect(borrower).borrow(ethers.parseEther("1000"));
      // $2000 collateral / $1000 debt = 200% ratio
      const ratio = await pool.getCollateralRatio(borrower.address);
      expect(ratio).to.equal(200);
    });
  });
});
