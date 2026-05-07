// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// A simplified lending pool:
// - Lenders deposit an ERC-20 token (e.g. USDC) and earn interest.
// - Borrowers deposit ETH as collateral and borrow the ERC-20 token.
// - Collateral ratio: borrowers must maintain > LIQUIDATION_THRESHOLD collateral value.
// - Interest: simple (not compounding) at INTEREST_RATE_BPS per year.
// - Liquidation: anyone can liquidate an undercollateralized position.
//
// NOTE: This is a simplified educational contract. It uses a hardcoded
// ETH/token price (set by the owner) instead of a real oracle.
// In production, use Chainlink or another oracle for price feeds.
contract LendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable loanToken;  // e.g. USDC

    uint256 public ethPriceInToken;     // owner-set: how many loanToken = 1 ETH (scaled by 1e18)
    uint256 public constant COLLATERAL_RATIO = 150;    // 150% — must deposit $150 ETH to borrow $100
    uint256 public constant LIQUIDATION_THRESHOLD = 120; // liquidate below 120% collateral ratio
    uint256 public constant INTEREST_RATE_BPS = 500;   // 5% APR in basis points
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    struct Position {
        uint256 collateralETH;   // ETH deposited
        uint256 borrowed;        // loanToken borrowed
        uint256 borrowTimestamp; // when the borrow started (for interest calc)
    }

    mapping(address => uint256) public deposits;   // lender deposits (loanToken)
    mapping(address => Position) public positions; // borrower positions
    uint256 public totalDeposits;
    uint256 public totalBorrowed;

    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);
    event CollateralDeposited(address indexed borrower, uint256 ethAmount);
    event Borrowed(address indexed borrower, uint256 amount);
    event Repaid(address indexed borrower, uint256 principal, uint256 interest);
    event Liquidated(address indexed borrower, address indexed liquidator, uint256 collateral);

    constructor(address _loanToken, uint256 _ethPriceInToken) Ownable(msg.sender) {
        loanToken = IERC20(_loanToken);
        ethPriceInToken = _ethPriceInToken;
    }

    // ─── Owner ───────────────────────────────────────────────────────────────

    function setEthPrice(uint256 newPrice) external onlyOwner {
        ethPriceInToken = newPrice;
    }

    // ─── Lender actions ──────────────────────────────────────────────────────

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot deposit 0");
        loanToken.safeTransferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdrawDeposit(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        uint256 available = loanToken.balanceOf(address(this));
        require(available >= amount, "Insufficient pool liquidity");
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        loanToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    // ─── Borrower actions ────────────────────────────────────────────────────

    function depositCollateral() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        positions[msg.sender].collateralETH += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot borrow 0");
        Position storage pos = positions[msg.sender];
        require(pos.borrowed == 0, "Repay existing loan first");
        require(loanToken.balanceOf(address(this)) >= amount, "Insufficient pool liquidity");

        // Check collateral: collateral value must be >= COLLATERAL_RATIO% of borrow
        uint256 collateralValue = (pos.collateralETH * ethPriceInToken) / 1e18;
        require(collateralValue * 100 >= amount * COLLATERAL_RATIO, "Insufficient collateral");

        pos.borrowed = amount;
        pos.borrowTimestamp = block.timestamp;
        totalBorrowed += amount;

        loanToken.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    function repay() external nonReentrant {
        Position storage pos = positions[msg.sender];
        require(pos.borrowed > 0, "No active loan");

        uint256 interest = _calculateInterest(pos.borrowed, pos.borrowTimestamp);
        uint256 totalDue = pos.borrowed + interest;

        loanToken.safeTransferFrom(msg.sender, address(this), totalDue);
        totalBorrowed -= pos.borrowed;

        uint256 collateral = pos.collateralETH;
        pos.collateralETH = 0;
        pos.borrowed = 0;
        pos.borrowTimestamp = 0;

        payable(msg.sender).transfer(collateral);
        emit Repaid(msg.sender, pos.borrowed, interest);
    }

    // ─── Liquidation ─────────────────────────────────────────────────────────

    function liquidate(address borrower) external nonReentrant {
        Position storage pos = positions[borrower];
        require(pos.borrowed > 0, "No active loan");
        require(_isLiquidatable(borrower), "Position is healthy");

        uint256 debt = pos.borrowed + _calculateInterest(pos.borrowed, pos.borrowTimestamp);
        uint256 collateral = pos.collateralETH;

        loanToken.safeTransferFrom(msg.sender, address(this), debt);
        totalBorrowed -= pos.borrowed;

        pos.collateralETH = 0;
        pos.borrowed = 0;
        pos.borrowTimestamp = 0;

        // Liquidator receives the collateral as reward
        payable(msg.sender).transfer(collateral);
        emit Liquidated(borrower, msg.sender, collateral);
    }

    // ─── View ────────────────────────────────────────────────────────────────

    function getDebt(address borrower) external view returns (uint256 principal, uint256 interest, uint256 total) {
        Position memory pos = positions[borrower];
        interest = _calculateInterest(pos.borrowed, pos.borrowTimestamp);
        return (pos.borrowed, interest, pos.borrowed + interest);
    }

    function getCollateralRatio(address borrower) external view returns (uint256) {
        Position memory pos = positions[borrower];
        if (pos.borrowed == 0) return type(uint256).max;
        uint256 collateralValue = (pos.collateralETH * ethPriceInToken) / 1e18;
        return (collateralValue * 100) / pos.borrowed;
    }

    function isLiquidatable(address borrower) external view returns (bool) {
        return _isLiquidatable(borrower);
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _calculateInterest(uint256 principal, uint256 start) internal view returns (uint256) {
        if (principal == 0 || start == 0) return 0;
        uint256 elapsed = block.timestamp - start;
        return (principal * INTEREST_RATE_BPS * elapsed) / (10000 * SECONDS_PER_YEAR);
    }

    function _isLiquidatable(address borrower) internal view returns (bool) {
        Position memory pos = positions[borrower];
        if (pos.borrowed == 0) return false;
        uint256 collateralValue = (pos.collateralETH * ethPriceInToken) / 1e18;
        return collateralValue * 100 < pos.borrowed * LIQUIDATION_THRESHOLD;
    }
}
