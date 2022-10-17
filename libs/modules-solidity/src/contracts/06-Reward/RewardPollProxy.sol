// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

/******************************************************************************\
* @title Reward Poll Proxy
* @author Evert Kors <evert@thx.network>
* @notice Supports relayed reward poll calls.
* 
* Implementations:
* TMP-6 Base poll: https://github.com/thxprotocol/modules/issues/6
* TMP-8 Rewards: https://github.com/thxprotocol/modules/issues/8
/******************************************************************************/

import '../TMP/TMP8/IRewardPollProxy.sol';
import '../TMP/TMP6/LibBasePollStorage.sol';

import '../TMP/RelayReceiver.sol';

contract RewardPollProxy is IRewardPollProxy, RelayReceiver {
    /**
     * @dev This function signs the _rewardPollVote function + parameters and
     * calls it on behalf of the original sender of the message.
     * @param _id Tbe reward ID the poll is started for.
     * @param _agree Boolean reflecting agreement with the poll.
     */
    function rewardPollVote(uint256 _id, bool _agree) external override {
        // Get the storage position for the given reward poll _id
        bytes32 position = LibBasePollStorage.getPosition(_id);
        // Get the function signature
        bytes4 sig = bytes4(keccak256('_rewardPollVote(bool)'));
        // Encode the function call with the given _agree argument
        bytes memory _call = abi.encodeWithSelector(sig, _agree);
        // Call the function on behalf of the original sender of the message.
        (bool success, bytes memory data) = address(this).call(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
    }

    function rewardPollRevokeVote(uint256 _id) external override {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_rewardPollRevokeVote()'));
        bytes memory _call = abi.encodeWithSelector(sig);

        (bool success, bytes memory data) = address(this).call(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
    }

    function rewardPollFinalize(uint256 _id) external override {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_rewardPollFinalize()'));
        bytes memory _call = abi.encodeWithSelector(sig);

        (bool success, bytes memory data) = address(this).call(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
    }

    function rewardPollApprovalState(uint256 _id) external view override returns (bool) {
        bytes32 position = LibBasePollStorage.getPosition(_id);
        bytes4 sig = bytes4(keccak256('_rewardPollApprovalState()'));
        bytes memory _call = abi.encodeWithSelector(sig);

        (bool success, bytes memory data) = address(this).staticcall(abi.encodePacked(_call, position, _msgSender()));
        require(success, string(data));
        return abi.decode(data, (bool));
    }
}
