// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Rewards (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default reward poll proxy
* 
* Implementations: 
* TMP-8 Rewards: https://github.com/thxprotocol/modules/issues/7
/******************************************************************************/

import '../06-Reward/RewardPollProxy.sol';

contract RewardByPollProxy is RewardPollProxy {}
