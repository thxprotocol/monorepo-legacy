// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Withdrawals (Bypass poll)
* @author Evert Kors <evert@thx.network>
* @dev Inherits default withdraw poll proxy
* 
* Implementations: 
* TMP-7 Withdrawals: https://github.com/thxprotocol/modules/issues/7
/******************************************************************************/

import '../05-Withdraw/WithdrawPollProxy.sol';

contract WithdrawByPollProxy is WithdrawPollProxy {}
