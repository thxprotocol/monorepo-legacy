// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import 'hardhat/console.sol';

contract BalancerVault {
    ERC20 public bpt;
    ERC20 public usdc;
    ERC20 public thx;

    struct JoinPoolRequest {
        address[] assets;
        uint256[] maxAmountsIn;
        bytes userData;
        bool fromInternalBalance;
    }

    constructor(address _bpt, address _usdc, address _thx) {
        bpt = ERC20(_bpt);
        usdc = ERC20(_usdc);
        thx = ERC20(_thx);
    }

    function joinPool(bytes32 poolId, address sender, address recipient, JoinPoolRequest memory request) external {
        usdc.transferFrom(sender, address(this), request.maxAmountsIn[0]);
        thx.transferFrom(sender, address(this), request.maxAmountsIn[1]);

        // Assumes BalancerVault has a BPT balance and transfers BPT to recipient
        uint256 amount = request.maxAmountsIn[0] + request.maxAmountsIn[1];     

        require(bpt.transfer(recipient, amount), 'BalancerVault: BPT transfer failed');
    }
}
