// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

/******************************************************************************\
* @title ERC20 Limited Supply
* @author Peter Polman <peter@thx.network>
* @notice Used for point systems with a limited supply. Mints the full supply to the to argument given in the contructor. 
* @dev Not upgradable contract.
/******************************************************************************/

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract LimitedSupplyToken is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        address to,
        uint256 amount
    ) ERC20(_name, _symbol) {
        _mint(to, amount);
    }
}
