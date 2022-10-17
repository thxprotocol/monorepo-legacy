// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ExampleToken is ERC20 {
    constructor(address to, uint256 amount) ERC20('Test Token', 'TEST') {
        _mint(to, amount);
    }
}
