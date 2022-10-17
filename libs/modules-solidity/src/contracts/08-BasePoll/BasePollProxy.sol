// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Base Poll Proxy
* @author Evert Kors <evert@thx.network>
* @notice Expose base poll storage.
* 
* Implementations: 
* TMP-6 Base Poll: https://github.com/thxprotocol/modules/issues/6
/******************************************************************************/

import '../TMP/TMP6/LibBasePollStorage.sol';
import '../TMP/TMP6/IBasePoll.sol';

contract BasePollProxy is IBasePoll {
    function getStartTime(uint256 _id) external view override returns (uint256) {
        return LibBasePollStorage.basePollStorageId(_id).startTime;
    }

    function getEndTime(uint256 _id) external view override returns (uint256) {
        return LibBasePollStorage.basePollStorageId(_id).endTime;
    }

    function getYesCounter(uint256 _id) external view override returns (uint256) {
        return LibBasePollStorage.basePollStorageId(_id).yesCounter;
    }

    function getNoCounter(uint256 _id) external view override returns (uint256) {
        return LibBasePollStorage.basePollStorageId(_id).noCounter;
    }

    function getTotalVoted(uint256 _id) external view override returns (uint256) {
        return LibBasePollStorage.basePollStorageId(_id).totalVoted;
    }

    function getVoteByAddress(uint256 _id, address _address)
        public
        view
        override
        returns (LibBasePollStorage.Vote memory)
    {
        return LibBasePollStorage.basePollStorageId(_id).votesByAddress[_address];
    }
}
