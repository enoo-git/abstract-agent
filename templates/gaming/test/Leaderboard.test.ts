import { expect } from "chai";
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

describe("Leaderboard", function () {
  let leaderboard: Contract;
  let owner: Wallet;
  let operator: Wallet;
  let player1: Wallet;
  let player2: Wallet;

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    operator = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    player1 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);
    player2 = getWallet(LOCAL_RICH_WALLETS[3].privateKey);

    leaderboard = await deployContract("Leaderboard", [], { wallet: owner });
  });

  describe("Deployment", function () {
    it("sets owner as default operator", async function () {
      expect(await leaderboard.operators(owner.address)).to.equal(true);
    });
  });

  describe("Operator management", function () {
    it("owner can add an operator", async function () {
      await leaderboard.addOperator(operator.address);
      expect(await leaderboard.operators(operator.address)).to.equal(true);
    });

    it("owner can remove an operator", async function () {
      await leaderboard.addOperator(operator.address);
      await leaderboard.removeOperator(operator.address);
      expect(await leaderboard.operators(operator.address)).to.equal(false);
    });

    it("non-owner cannot add operator", async function () {
      await expect(
        leaderboard.connect(player1).addOperator(player1.address)
      ).to.be.revertedWithCustomError(leaderboard, "OwnableUnauthorizedAccount");
    });
  });

  describe("Score submission", function () {
    beforeEach(async function () {
      await leaderboard.addOperator(operator.address);
    });

    it("operator can submit a score", async function () {
      await leaderboard.connect(operator).submitScore(player1.address, 1000);
      expect(await leaderboard.personalBest(player1.address)).to.equal(1000n);
    });

    it("updates personal best when score is higher", async function () {
      await leaderboard.connect(operator).submitScore(player1.address, 500);
      await leaderboard.connect(operator).submitScore(player1.address, 1500);
      expect(await leaderboard.personalBest(player1.address)).to.equal(1500n);
    });

    it("does not update personal best when score is lower", async function () {
      await leaderboard.connect(operator).submitScore(player1.address, 1000);
      await leaderboard.connect(operator).submitScore(player1.address, 200);
      expect(await leaderboard.personalBest(player1.address)).to.equal(1000n);
    });

    it("non-operator cannot submit score", async function () {
      await expect(
        leaderboard.connect(player1).submitScore(player1.address, 999)
      ).to.be.revertedWith("Not operator");
    });

    it("emits NewScore event", async function () {
      await expect(
        leaderboard.connect(operator).submitScore(player1.address, 750)
      )
        .to.emit(leaderboard, "NewScore")
        .withArgs(player1.address, 750);
    });
  });

  describe("Top scores", function () {
    it("returns 10 slots", async function () {
      const scores = await leaderboard.getTopScores();
      expect(scores.length).to.equal(10);
    });

    it("stores high scores correctly", async function () {
      await leaderboard.submitScore(player1.address, 9999);
      const scores = await leaderboard.getTopScores();
      const found = scores.some(
        (s: { player: string; score: bigint }) =>
          s.player === player1.address && s.score === 9999n
      );
      expect(found).to.equal(true);
    });
  });

  describe("Reset", function () {
    it("owner can reset the leaderboard", async function () {
      await leaderboard.submitScore(player1.address, 500);
      await leaderboard.resetLeaderboard();
      const scores = await leaderboard.getTopScores();
      const allZero = scores.every(
        (s: { score: bigint }) => s.score === 0n
      );
      expect(allZero).to.equal(true);
    });
  });
});
