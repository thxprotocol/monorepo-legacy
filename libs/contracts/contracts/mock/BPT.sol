// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BPT is ERC20 {
    constructor(address to, uint256 amount) ERC20('20USDC-80THX', '20USDC-80THX') {
        _mint(to, amount);
    }
}
