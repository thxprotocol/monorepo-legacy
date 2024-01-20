// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
// pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BPT is ERC20 {
    constructor() ERC20('20USDC-80THX', '20USDC-80THX') {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
