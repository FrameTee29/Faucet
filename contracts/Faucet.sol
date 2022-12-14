// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet {
    address public owner;
    uint256 public amountAllowed = 1000 ether;

    /**
     * LockTime
     * address of user => address token => timestamp
     */
    mapping(address => mapping(address => uint256)) public lockTime;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    event DonateToken(address indexed from, address indexed to, uint256 amount);

    event RequestToken(
        address indexed to,
        uint256 amount,
        address tokenAddress
    );

    constructor() {
        owner = msg.sender;
    }

    /**
     * setOwner
     * function to change the owner.  Only the owner of the contract can call this function
     */
    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function setAmountallowed(uint256 newAmountAllowed) public onlyOwner {
        amountAllowed = newAmountAllowed;
    }

    function getBalanceOfFaucet(address tokenAddress)
        public
        view
        returns (uint256)
    {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function donateTofaucet(address tokenAddress, uint256 amount) public {
        require(
            IERC20(tokenAddress).balanceOf(msg.sender) >= amount,
            "Not enough."
        );
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);

        emit DonateToken(msg.sender, address(this), amount);
    }

    function requestToken(address tokenAddress) external {
        //perform a few checks to make sure function can execute
        require(
            block.timestamp > lockTime[msg.sender][tokenAddress],
            "lock time has not expired. Please try again later"
        );

        uint256 amount = IERC20(tokenAddress).balanceOf(address(this));
        require(
            amount > amountAllowed,
            "Not enough funds in the faucet. Please donate"
        );

        IERC20(tokenAddress).transfer(msg.sender, amountAllowed);

        //updates locktime 1 day from now
        lockTime[msg.sender][tokenAddress] = block.timestamp + 1 days;

        emit RequestToken(msg.sender, amountAllowed, tokenAddress);
    }
}
