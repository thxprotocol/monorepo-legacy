// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

interface IWithdrawPoll {
    event Withdrawn(uint256 id, address indexed member, uint256 reward);
    event WithdrawPollVoted(uint256 id, address indexed member, bool vote);
    event WithdrawPollFinalized(uint256 id, bool approved);
    event WithdrawPollRevokedVote(uint256 id, address indexed member);
    event WithdrawFeeCollected(uint256 fee);

    function getBeneficiary(uint256 _id) external view returns (uint256);

    function getAmount(uint256 _id) external view returns (uint256);

    function _withdrawPollVote(bool _agree) external;

    function _withdrawPollRevokeVote() external;

    function _withdrawPollFinalize() external;

    function _withdrawPollApprovalState() external view returns (bool);
}
