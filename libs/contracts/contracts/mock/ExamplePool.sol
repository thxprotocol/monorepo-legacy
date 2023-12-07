// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ExamplePool is ERC20 {
    constructor(address to, uint256 amount) ERC20('Test Token', 'TEST') {
        _mint(to, amount);
    }

    struct JoinPoolRequest {
        address[] assets;
        uint256[] maxAmountsIn;
        bytes userData;
        bool fromInternalBalance;
    }

    function joinPool(bytes32 poolId, address sender, address recipient, JoinPoolRequest calldata request) public {
        _mint(recipient, request.maxAmountsIn);
    }
}
