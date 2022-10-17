// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

interface IWithdrawPollProxy {
    function withdrawPollVote(uint256 _id, bool _agree) external;

    function withdrawPollRevokeVote(uint256 _id) external;

    function withdrawPollFinalize(uint256 _id) external;

    function withdrawPollApprovalState(uint256 _id) external view returns (bool);
}
