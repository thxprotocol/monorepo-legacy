// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

interface IWithdraw {
    event WithdrawPollCreated(uint256 id, uint256 indexed member);

    function proposeWithdraw(uint256 _amount, address _beneficiary) external;

    function proposeBulkWithdraw(uint256[] memory _amounts, address[] memory _beneficiaries) external;

    function setProposeWithdrawPollDuration(uint256 _duration) external;

    function getProposeWithdrawPollDuration() external view returns (uint256);
}
