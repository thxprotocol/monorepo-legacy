// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IERC173.sol';
import 'diamond-2/contracts/interfaces/IDiamondLoupe.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';
import './TMP/TMP1/IAccessControl.sol';
import './TMP/TMP1/IAccessControlEvents.sol';
import './TMP/TMP2/IMemberID.sol';
import './TMP/TMP3/IPoolRoles.sol';
import './TMP/TMP5/IToken.sol';
import './TMP/TMP6/IBasePoll.sol';
import './TMP/TMP7/IWithdraw.sol';
import './TMP/TMP7/IWithdrawPoll.sol';
import './TMP/TMP7/IWithdrawPollProxy.sol';
import './TMP/TMP8/IReward.sol';
import './TMP/TMP8/IRewardPoll.sol';
import './TMP/TMP8/IRewardPollProxy.sol';
import './TMP/TMP9/IRelayHub.sol';

interface IDefaultDiamond is
    IERC173,
    IDiamondLoupe,
    IDiamondCut,
    IAccessControl,
    IAccessControlEvents,
    IMemberID,
    IPoolRoles,
    IToken,
    IBasePoll,
    IWithdraw,
    IWithdrawPoll,
    IWithdrawPollProxy,
    IReward,
    IRewardPoll,
    IRewardPollProxy,
    IRelayHub
{
    function setupMockAccess(bytes32[] memory roles, address[] memory addr) external;
}
