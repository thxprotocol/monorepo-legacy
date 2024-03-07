// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract THX is ERC20 {
    constructor(address to, uint256 amount) ERC20('THX Network (PoS)', 'THX') {
        _mint(to, amount);
    }
}
