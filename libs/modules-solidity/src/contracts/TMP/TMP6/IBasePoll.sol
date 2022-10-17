// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import './LibBasePollStorage.sol';

interface IBasePoll {
    function getStartTime(uint256 _id) external view returns (uint256);

    function getEndTime(uint256 _id) external view returns (uint256);

    function getYesCounter(uint256 _id) external view returns (uint256);

    function getNoCounter(uint256 _id) external view returns (uint256);

    function getTotalVoted(uint256 _id) external view returns (uint256);

    function getVoteByAddress(uint256 _id, address _address) external view returns (LibBasePollStorage.Vote memory);
}
