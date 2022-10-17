// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibWithdrawPollStorage {
    bytes32 constant WITHDRAW_STORAGE = keccak256('diamond.contract.assetpool.withdrawpoll');

    struct WithdrawStorage {
        uint256 proposeWithdrawPollDuration;
    }

    function withdrawStorage() internal pure returns (WithdrawStorage storage bs) {
        bytes32 position = WITHDRAW_STORAGE;
        assembly {
            bs.slot := position
        }
    }

    struct WithdrawPollStorage {
        uint256 beneficiary;
        uint256 amount;
    }

    function getPosition(uint256 _id) internal pure returns (bytes32) {
        return keccak256(abi.encode('diamond.contract.assetpool.withdrawpoll', _id));
    }

    function withdrawPollStorage(bytes32 _pos) internal pure returns (WithdrawPollStorage storage bs) {
        assembly {
            bs.slot := _pos
        }
    }

    function withdrawPollStorageId(uint256 _id) internal pure returns (WithdrawPollStorage storage bs) {
        bytes32 position = getPosition(_id);
        assembly {
            bs.slot := position
        }
    }
}
