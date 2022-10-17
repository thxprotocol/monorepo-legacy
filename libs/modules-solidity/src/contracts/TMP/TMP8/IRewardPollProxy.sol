// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IRewardPollProxy {
    function rewardPollVote(uint256 _id, bool _agree) external;

    function rewardPollRevokeVote(uint256 _id) external;

    function rewardPollFinalize(uint256 _id) external;

    function rewardPollApprovalState(uint256 _id) external view returns (bool);
}
