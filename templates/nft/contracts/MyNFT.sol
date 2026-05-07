// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant MINT_PRICE = 0.01 ether;

    uint256 private _nextTokenId;
    string private _baseTokenURI;
    bool public saleActive;

    event Minted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function mint(uint256 quantity) external payable {
        require(saleActive, "Sale not active");
        require(quantity > 0 && quantity <= 10, "Quantity must be 1-10");
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value == MINT_PRICE * quantity, "Wrong ETH amount");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId);
        }
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, _nextTokenId++);
        }
    }

    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
