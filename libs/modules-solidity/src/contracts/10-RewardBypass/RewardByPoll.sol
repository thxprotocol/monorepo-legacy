// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Rewards (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default reward poll, but will always approve it.
* 
* Implementations: 
* TMP-8 Rewards: https://github.com/thxprotocol/modules/issues/7
/******************************************************************************/

import '../06-Reward/RewardPoll.sol';

contract RewardByPoll is RewardPoll {
    function _rewardPollApprovalState() public view virtual override isReward returns (bool) {
        return true;
    }
}
