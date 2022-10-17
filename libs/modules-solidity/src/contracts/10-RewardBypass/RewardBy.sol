// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Rewards (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default reward implementation.
* 
* Implementations: 
* TMP-8 Rewards: https://github.com/thxprotocol/modules/issues/7
/******************************************************************************/

import '../06-Reward/Reward.sol';

contract RewardBy is Reward {}
