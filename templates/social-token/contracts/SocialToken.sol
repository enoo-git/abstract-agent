// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract SocialToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18; // 10M tokens
    uint256 public constant AIRDROP_AMOUNT = 100 * 10 ** 18;    // 100 tokens per claim

    bytes32 public merkleRoot;
    mapping(address => bool) public hasClaimed;
    bool public airdropActive;

    event AirdropClaimed(address indexed claimer, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    // Set the merkle root for the airdrop whitelist
    // Generate with: https://github.com/OpenZeppelin/merkle-tree
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
    }

    function toggleAirdrop() external onlyOwner {
        airdropActive = !airdropActive;
    }

    // Claim airdrop with merkle proof
    function claimAirdrop(bytes32[] calldata proof) external {
        require(airdropActive, "Airdrop not active");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(totalSupply() + AIRDROP_AMOUNT <= MAX_SUPPLY, "Airdrop exhausted");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Not whitelisted");

        hasClaimed[msg.sender] = true;
        _mint(msg.sender, AIRDROP_AMOUNT);
        emit AirdropClaimed(msg.sender, AIRDROP_AMOUNT);
    }

    // Direct airdrop without whitelist (owner only, for manual distributions)
    function airdropTo(address[] calldata recipients, uint256 amount) external onlyOwner {
        require(totalSupply() + (amount * recipients.length) <= MAX_SUPPLY, "Exceeds max supply");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amount);
        }
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
