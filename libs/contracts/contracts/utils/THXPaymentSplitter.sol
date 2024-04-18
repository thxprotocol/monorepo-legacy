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

contract THXPaymentSplitter is ReentrancyGuard, Context {
    using SafeMath for uint256;

    address admin;
    ITHXRegistry public registry;
    IGauge public gauge;
    IWeightedPool public bpt; 
    BalancerVault public vault;
    IERC20 public paymentToken;

    mapping(address => uint256) public rates;
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _lastPaymentAt;

    constructor(address _admin, address _registry) {
        admin = _admin;
        registry = ITHXRegistry(_registry);
        paymentToken = IERC20(registry.getPaymentToken());
        gauge = BPTGauge(registry.getGauge());
        bpt = IWeightedPool(gauge.lp_token());
        vault = BalancerVault(bpt.getVault());
    }

    // @dev Only admin can change this
    function setRegistry(address _registry) external {
        require(_msgSender() == admin, 'PaymentSplitter: !admin');
        registry = ITHXRegistry(_registry);
    }

    // Set the USDC rate in wei per second for the sender
    function setRate(address _owner, uint256 _rate) external {
        require(_msgSender() == admin, 'PaymentSplitter: !admin');
        rates[_owner] = _rate;
    }

    /*
    * Transfers USDC to the payee based on the payout rate. Then it adds liquidity for the remainder of the deposit amount and stakes the
    * received BPT. On success the balance and last payment timestamp are stored in reference to the owner and used when fetching returning 
    * the balance.
    * @param _owner Owner of the payment balance
    * @param _amount Amount of USDC to deposit
    * 
    * @notice Assumes paymentToken allowance for address(this) is sufficient for the call
    * @dev ReentrancyGuard is implemented for the deposit call in case THXRegistry ever gets compromised
    */
    function deposit(address _owner, uint256 _amount, uint256 _minAmountOut) external nonReentrant {
        // Don't allow payments if no rate is set for owner
        require(rates[_owner] > 0, 'PaymentSplitter: !rate');
 
        // Transfer deposit amount to self for further splitting. 
        // @notice Avoids having the caller approve for multiple transfers
        require(
            paymentToken.transferFrom(_owner, address(this), _amount),
            'PaymentSplitter: transfer failed'
        );

        // Transfer payout to payee in paymentToken as per payout rate determined by registry
        uint256 payoutRate = registry.getPayoutRate();
        uint256 payout = _amount.mul(payoutRate).div(10000); // 100% * 100 to allow for 2 decimals without devisisons
        
        require(
            paymentToken.transfer(registry.getPayee(), payout),
            'PaymentSplitter: transfer failed'
        );

        // Define the assets used for the Balancer pool join
        address[] memory _assets = new address[](2);
        _assets[0] = address(paymentToken);
        _assets[1] = address(0);

        // Subtract the payout that's transferred to the payee before setting the amounts in for pool join
        uint256[] memory _maxAmountsIn = new uint256[](2);
        _maxAmountsIn[0] = _amount.sub(payout);
        _maxAmountsIn[1] = 0;

        // Create Balancer liqiuidity position for remainder of the _amount
        paymentToken.approve(address(vault), _maxAmountsIn[0]);
        vault.joinPool(bpt.getPoolId(), address(this), address(this), BalancerVault.JoinPoolRequest({
            assets: _assets,
            maxAmountsIn: _maxAmountsIn,
            userData: abi.encode(1, _maxAmountsIn, _minAmountOut), // WeightedPoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT = 1
            fromInternalBalance: false
        }));

        // Approve and stake all received BPT and receive BPT-gauge tokens
        // TODO Potentially harmful if multiple transactions are mined in the same block
        uint256 bptAmount = bpt.balanceOf(address(this));
        bpt.approve(address(gauge), bptAmount);
        gauge.deposit(bptAmount);

        // Transfer BPT-gauge to the RewardDistributor for further distribution
        uint256 bptGaugeAmount = gauge.balanceOf(address(this));
        require(gauge.transfer(registry.getRewardDistributor(), bptGaugeAmount), 'PaymentSplitter: transfer failed');

        // Increase total balance for _owner
        _balances[_owner] = _balances[_owner].add(_amount);

        // Store lastPaymentAt timestamp for _owner
        _lastPaymentAt[_owner] = block.timestamp;
    }
 
    /*
    * @return Current payment balance of owner measured since last payment made and rate set
    */
    function balanceOf(address _owner) public view returns (uint256) {
        uint256 rate = rates[_owner]; // USDC rate in wei per second for _owner
        uint256 lastPaymentAt = _lastPaymentAt[_owner]; // block.timestamp of last payment
        // If no payments have been made return 0
        if (lastPaymentAt == 0)  {
            return 0;
        }

        // Required balances equals seconds since last payment * rate per second
        uint256 currentBlock = block.timestamp;
        
        // Will always be positive since lastPaymentAt is always a historic timestamp
        uint256 balanceRequired = currentBlock.sub(lastPaymentAt).mul(rate);

        // If balance is insufficient return 0
        if (_balances[_owner] < balanceRequired) {
            return 0;
        }
        
        // Safe to subtract as we have checked for balance to be greater than balanceRequired
        return _balances[_owner].sub(balanceRequired);
    }
}
