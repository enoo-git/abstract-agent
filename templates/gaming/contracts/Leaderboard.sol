// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Leaderboard is Ownable {
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    uint256 public constant TOP_SIZE = 10;

    Score[TOP_SIZE] public topScores;
    mapping(address => uint256) public personalBest;

    event NewScore(address indexed player, uint256 score);
    event NewHighScore(address indexed player, uint256 score, uint256 rank);

    // Authorized game servers / operators that can submit scores
    mapping(address => bool) public operators;

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner(), "Not operator");
        _;
    }

    constructor() Ownable(msg.sender) {
        operators[msg.sender] = true;
    }

    function addOperator(address operator) external onlyOwner {
        operators[operator] = true;
    }

    function removeOperator(address operator) external onlyOwner {
        operators[operator] = false;
    }

    function submitScore(address player, uint256 score) external onlyOperator {
        emit NewScore(player, score);

        if (score > personalBest[player]) {
            personalBest[player] = score;
        }

        uint256 lowestIdx = 0;
        uint256 lowestScore = topScores[0].score;

        for (uint256 i = 1; i < TOP_SIZE; i++) {
            if (topScores[i].score < lowestScore) {
                lowestScore = topScores[i].score;
                lowestIdx = i;
            }
        }

        if (score > lowestScore) {
            topScores[lowestIdx] = Score({
                player: player,
                score: score,
                timestamp: block.timestamp
            });
            emit NewHighScore(player, score, lowestIdx);
        }
    }

    function getTopScores() external view returns (Score[TOP_SIZE] memory) {
        return topScores;
    }

    function resetLeaderboard() external onlyOwner {
        for (uint256 i = 0; i < TOP_SIZE; i++) {
            delete topScores[i];
        }
    }
}
