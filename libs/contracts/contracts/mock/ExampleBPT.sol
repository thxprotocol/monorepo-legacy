// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ExampleBPT is ERC20 {
    constructor(address to, uint256 amount) ERC20('80THX-20USDC', '80THX-20USDC') {
        _mint(to, amount);
    }
}
