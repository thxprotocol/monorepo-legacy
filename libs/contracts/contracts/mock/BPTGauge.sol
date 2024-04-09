// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BPTGauge is ERC20 {
    ERC20 public bpt;

    event Deposit(address indexed user, uint256 value);
    event Withdraw(address indexed user, uint256 value);

    constructor(address _bpt) ERC20('Balancer 20USDC-80THX Gauge Deposit', '20USDC-80THX-gauge') {
        bpt = ERC20(_bpt);
    }

    /*
     *  @dev Deposit LP tokens in the gauge and mint BPTGauge for msg.sender
     *  @param _value Amount of LP tokens to deposit
     */
    function deposit(uint256 _value) external {
        // Transfer BPT from the user to the gauge
        bpt.transferFrom(msg.sender, address(this), _value);

        // Mint BPTGauge tokens to the user
        _mint(msg.sender, _value);

        emit Deposit(msg.sender, _value);
    }

    /*
     *  @dev Withdraw LP tokens from the gauge
     *  @param _value Amount of LP tokens to withdraw
     *  @notice This mock function will not decrease the totalSupply
     */
    function withdraw(uint256 _value) external {
        // Transfer staked BPT from the gauge to the user
        ERC20(bpt).transfer(msg.sender, _value);

        // Burn BPTGauge for the user
        transferFrom(msg.sender, address(0), _value);

        emit Withdraw(msg.sender, _value);
    }

    function lp_token() external view returns (address) {
        return address(bpt);
    }
}
