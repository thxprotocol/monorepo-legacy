// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

interface ITHXRegistry {
    function getRewardDistributor() external view returns (address);
    function getPayoutRate() external view returns (uint256);
    function getPayee() external view returns (address);
    function getPaymentToken() external view returns (address);
    function getGauge() external view returns (address);
}

contract THXRegistry is ITHXRegistry {
    address public paymentToken; // USDC
    address public payee;
    uint256 public payoutRate;
    address public rewardDistributor; // VoteEscrow RewardDistributor
    address public gauge; // Balancer ChildChain Liquidity Gauge

    /*
     * @param _paymentToken Token address used for payouts to payee
     * @param _payee Payee address receiving payouts as per payoutRate
     * @param _rewardDistributor VoteEscrow RewardDistributor address
     * @param _gauge Balancer child chain gauge address
     * @param _payoutRate Share of payouts to payee as percentage times 100 (3000)
     */
    constructor(address _paymentToken, address _payee, address _rewardDistributor, address _gauge) {
        paymentToken = _paymentToken;
        payee = _payee;
        rewardDistributor = _rewardDistributor;
        gauge = _gauge;
    }

    function getRewardDistributor() external view override returns (address) {
        return rewardDistributor;
    }

    function getPayoutRate() external view override returns (uint256) {
        return payoutRate;
    }

    // @notice Payout rate as a percentage times 100 (3000 for 30%)
    // @dev Should be governed with parameter voting
    function setPayoutRate(uint256 _rate) external {
        require(msg.sender == payee, 'THXRegistry: !payee');
        require(_rate >= 0 && _rate <= 10000, 'THXRegistry: payoutRate out of bounds');
        payoutRate = _rate;
    }
    
    function getPayee() external view override returns (address) {
        return payee;
    }

    function getPaymentToken() external view override returns (address) {
        return paymentToken;
    }

    function getGauge() external view override returns (address) {
        return gauge;
    }

}
