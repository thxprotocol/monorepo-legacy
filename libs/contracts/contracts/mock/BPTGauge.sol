// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

interface IGauge is IERC20 {
    function deposit(uint256 _value) external;
    function withdraw(uint256 _value) external;
    function lp_token() external view returns (address);
    function working_supply() external view returns (uint256);
}

contract BPTGauge is ERC20, IGauge {
    IERC20 public bpt;

    event Deposit(address indexed user, uint256 value);
    event Withdraw(address indexed user, uint256 value);

    constructor(address _bpt) ERC20('Balancer 20USDC-80THX Gauge Deposit', '20USDC-80THX-gauge') {
        bpt = IERC20(_bpt);
    }

    /*
     *  @dev Deposit LP tokens in the gauge and mint BPTGauge for msg.sender
     *  @param _value Amount of LP tokens to deposit
     */
    function deposit(uint256 _value) external override {
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
    function withdraw(uint256 _value) external override {
        // Transfer staked BPT from the gauge to the user
        bpt.transfer(msg.sender, _value);

        // Burn BPTGauge for the user
        transferFrom(msg.sender, address(0), _value);

        emit Withdraw(msg.sender, _value);
    }

    function lp_token() external override view returns (address) {
        return address(bpt);
    }

    function working_supply() external override pure returns (uint256) {
        return 585909572986408132343905;
    }
}
