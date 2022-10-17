// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdrawals (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default withdraw implementation
* 
* Implementations: 
* TMP-7 Withdrawals: https://github.com/thxprotocol/modules/issues/7
/******************************************************************************/

import '../05-Withdraw/Withdraw.sol';

contract WithdrawBy is Withdraw {}
