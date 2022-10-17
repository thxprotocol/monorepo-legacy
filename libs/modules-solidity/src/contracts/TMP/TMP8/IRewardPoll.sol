// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IRewardPoll {
    event RewardPollDisabled(uint256 id);
    event RewardPollEnabled(uint256 id);
    event RewardPollUpdated(uint256 id, uint256 amount, uint256 duration);
    event RewardPollVoted(uint256 id, address indexed member, bool vote);
    event RewardPollFinalized(uint256 id, bool approved);
    event RewardPollRevokedVote(uint256 id, address indexed member);

    function getWithdrawAmount(uint256 _id) external view returns (uint256);

    function getWithdrawDuration(uint256 _id) external view returns (uint256);

    function getRewardIndex(uint256 _id) external view returns (uint256);

    function _rewardPollVote(bool _agree) external;

    function _rewardPollRevokeVote() external;

    function _rewardPollFinalize() external;

    function _rewardPollApprovalState() external view returns (bool);
}
