// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// A minimal AMM (Automated Market Maker) — the same model as Uniswap V2.
// Liquidity providers deposit tokenA + tokenB and receive LP tokens.
// Traders swap one token for the other using the constant product formula: x * y = k.
// Fee: 0.3% on every swap, distributed to liquidity providers.
contract SimpleAMM is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 private reserveA;
    uint256 private reserveB;

    uint256 private constant FEE_NUMERATOR = 997;   // 0.3% fee
    uint256 private constant FEE_DENOMINATOR = 1000;
    uint256 private constant MINIMUM_LIQUIDITY = 1000;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpMinted);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpBurned);
    event Swap(address indexed trader, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) ERC20("LP Token", "LP") {
        require(_tokenA != _tokenB, "Identical tokens");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // ─── View ────────────────────────────────────────────────────────────────

    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB) {
        return (reserveA, reserveB);
    }

    function getAmountOut(uint256 amountIn, bool aToB) public view returns (uint256) {
        require(amountIn > 0, "Insufficient input");
        (uint256 resIn, uint256 resOut) = aToB ? (reserveA, reserveB) : (reserveB, reserveA);
        require(resIn > 0 && resOut > 0, "No liquidity");
        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        return (amountInWithFee * resOut) / (resIn * FEE_DENOMINATOR + amountInWithFee);
    }

    // ─── Liquidity ───────────────────────────────────────────────────────────

    function addLiquidity(
        uint256 amountA,
        uint256 amountB,
        uint256 minLP
    ) external nonReentrant returns (uint256 lpMinted) {
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        uint256 supply = totalSupply();
        if (supply == 0) {
            lpMinted = _sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(address(0xdead), MINIMUM_LIQUIDITY); // lock minimum liquidity forever
        } else {
            lpMinted = _min(
                (amountA * supply) / reserveA,
                (amountB * supply) / reserveB
            );
        }

        require(lpMinted >= minLP, "Slippage: insufficient LP");
        _mint(msg.sender, lpMinted);
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, lpMinted);
    }

    function removeLiquidity(
        uint256 lpAmount,
        uint256 minA,
        uint256 minB
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        uint256 supply = totalSupply();
        amountA = (lpAmount * reserveA) / supply;
        amountB = (lpAmount * reserveB) / supply;

        require(amountA >= minA && amountB >= minB, "Slippage: insufficient output");

        _burn(msg.sender, lpAmount);
        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, lpAmount);
    }

    // ─── Swap ────────────────────────────────────────────────────────────────

    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "Invalid token");

        bool aToB = tokenIn == address(tokenA);
        amountOut = getAmountOut(amountIn, aToB);
        require(amountOut >= minAmountOut, "Slippage: insufficient output");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        if (aToB) {
            reserveA += amountIn;
            reserveB -= amountOut;
            tokenB.safeTransfer(msg.sender, amountOut);
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
            tokenA.safeTransfer(msg.sender, amountOut);
        }

        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) { z = x; x = (y / x + x) / 2; }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}
