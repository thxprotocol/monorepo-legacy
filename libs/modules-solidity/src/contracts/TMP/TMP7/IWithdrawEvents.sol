// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

interface IWithdrawEvents {
    event WithdrawPollCreated(uint256 id, uint256 indexed member);
}
