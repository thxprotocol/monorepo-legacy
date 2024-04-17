// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract USDC is ERC20 {
    constructor(address to, uint256 amount) ERC20('USD Coin (PoS)', 'USDC.e') {
        _setupDecimals(6);
        _mint(to, amount);
    }
}
