// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YCToken (Yue Chu Token)
 * @dev ERC20 代币合约，支持 ETH 兑换功能
 * 兑换比例：0.0001 ETH = 1 YCT
 */
contract YCToken is ERC20, Ownable {
    // 兑换比例：1 YCT = 0.0001 ETH (即 1 ETH = 10000 YCT)
    uint256 public constant EXCHANGE_RATE = 10000; // 1 ETH = 10000 YCT
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 100万 YCT

    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount);

    constructor() ERC20("Yue Chu Token", "YCT") Ownable(msg.sender) {
        // 初始发行量全部铸造给 deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev 使用 ETH 购买 YCT
     * 用户发送 ETH，按比例获得 YCT
     */
    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");

        // 计算可以购买的代币数量：ETH * 10000
        uint256 tokenAmount = msg.value * EXCHANGE_RATE;

        // 检查合约是否有足够的代币
        require(balanceOf(owner()) >= tokenAmount, "Insufficient tokens in reserve");

        // 从 owner 转账代币给买家
        _transfer(owner(), msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    /**
     * @dev 出售 YCT 换回 ETH
     * @param tokenAmount 要出售的代币数量
     */
    function sellTokens(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Must sell more than 0 tokens");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");

        // 计算应该返还的 ETH 数量
        uint256 ethAmount = tokenAmount / EXCHANGE_RATE;
        require(ethAmount > 0, "Token amount too small");
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");

        // 转账代币到 owner
        _transfer(msg.sender, owner(), tokenAmount);

        // 返还 ETH 给卖家
        payable(msg.sender).transfer(ethAmount);

        emit TokensSold(msg.sender, tokenAmount, ethAmount);
    }

    /**
     * @dev Owner 可以提取合约中的 ETH
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev 获取 ETH 对应的 YCT 数量
     */
    function getTokenAmount(uint256 ethAmount) public pure returns (uint256) {
        return ethAmount * EXCHANGE_RATE;
    }

    /**
     * @dev 获取 YCT 对应的 ETH 数量
     */
    function getETHAmount(uint256 tokenAmount) public pure returns (uint256) {
        return tokenAmount / EXCHANGE_RATE;
    }

    /**
     * @dev 允许合约接收 ETH
     */
    receive() external payable {}
}
