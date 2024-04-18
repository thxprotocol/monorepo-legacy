// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '../mock/BalancerVault.sol';
import '../mock/BPTGauge.sol';
import '../mock/BPT.sol'; 
import './THXRegistry.sol';

contract THXMembershipPurchaser is ReentrancyGuard, Context {
    address admin;
    ITHXRegistry public registry;
    IWeightedPool public bpt; 
    IGauge public gauge;
    BalancerVault public vault;

    constructor(address _admin, address _registry) {
        admin = _admin;
        registry = ITHXRegistry(_registry);
        gauge = BPTGauge(registry.getGauge());
        bpt = IWeightedPool(gauge.lp_token());
        vault = BalancerVault(bpt.getVault());
    }

    /*
    * Joins the Balancer pool with the provided _tokenIn and stakes the received BPT-gauge tokens. On success the BPT-gauge tokens are
    * transferred back to the caller and can be locked.
    * @param _owner Owner of the payment balance
    * @param _amountIn Amount of _tokenIn to provide as liquidity and stake
    * @param _minAmountOut Minimum amount of BPT to receive
    */
    function joinAndStake(address _owner, address _tokenIn, uint256 _amountIn, uint256 _minAmountOut) external nonReentrant {
        // @notice Avoids having the caller approve for multiple transfers
        require(
            IERC20(_tokenIn).transferFrom(_owner, address(this), _amountIn),
            'MembershipPurchaser: transfer failed'
        );

        // Define the assets used for the Balancer pool join
        address[] memory _assets = new address[](2);
        _assets[0] = _tokenIn;
        _assets[1] = address(0);

        // Define the max amounts in for the Balancer pool join
        uint256[] memory _maxAmountsIn = new uint256[](2);
        _maxAmountsIn[0] = _amountIn;
        _maxAmountsIn[1] = 0;

        // Create Balancer liqiuidity position for _amountIn in _tokenIn
        IERC20(_tokenIn).approve(address(vault), _maxAmountsIn[0]);
        vault.joinPool(bpt.getPoolId(), address(this), address(this), BalancerVault.JoinPoolRequest({
            assets: _assets,
            maxAmountsIn: _maxAmountsIn,
            userData: abi.encode(1, _maxAmountsIn, _minAmountOut), // WeightedPoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT = 1
            fromInternalBalance: false
        }));

        // Approve and stake all received BPT and receive BPT-gauge tokens
        uint256 bptAmount = bpt.balanceOf(address(this));
        bpt.approve(address(gauge), bptAmount);
        gauge.deposit(bptAmount);

        // Transfer BPT-gauge to the RewardDistributor for further distribution
        uint256 bptGaugeAmount = gauge.balanceOf(address(this));
        gauge.transfer(_owner, bptGaugeAmount);
    }

}
