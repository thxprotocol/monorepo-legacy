// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import './LibRewardPollStorage.sol';

interface IReward {
    event RewardPollCreated(uint256 id, address indexed member, uint256 rewardID, uint256 proposal);

    function setRewardPollDuration(uint256 _duration) external;

    function getRewardPollDuration() external view returns (uint256);

    function addReward(uint256 _withdrawAmount, uint256 _withdrawDuration) external;

    function getReward(uint256 _id) external view returns (LibRewardPollStorage.Reward memory);

    function updateReward(
        uint256 _id,
        uint256 _withdrawAmount,
        uint256 _withdrawDuration
    ) external;

    function enableReward(uint256 _id) external;

    function disableReward(uint256 _id) external;

    function claimRewardFor(uint256 _id, address _beneficiary) external;

    function claimReward(uint256 _id) external;
}
