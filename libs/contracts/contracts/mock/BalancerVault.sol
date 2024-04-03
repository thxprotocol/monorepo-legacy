// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BalancerVault {
    address public bpt;
    address public usdc;
    address public thx;

    struct JoinPoolRequest {
        address[] assets;
        uint256[] maxAmountsIn;
        bytes userData;
        bool fromInternalBalance;
    }

    constructor(address _bpt, address _usdc, address _thx) {
        bpt = _bpt;
        usdc = _usdc;
        thx = _thx;
    }

    function joinPool(bytes32 poolId, address sender, address recipient, JoinPoolRequest memory request) external {
        // transfer USDC and THX from sender to this contract to simulate proper balance update
        IERC20(usdc).transferFrom(sender, address(this), request.maxAmountsIn[0]);
        IERC20(thx).transferFrom(sender, address(this), request.maxAmountsIn[1]);

        // Assumes BalancerVault has a BPT balance and transfers BPT to recipient
        uint256 amount = request.maxAmountsIn[0] + request.maxAmountsIn[1];
        IERC20(bpt).transfer(recipient, amount);
    }
}
