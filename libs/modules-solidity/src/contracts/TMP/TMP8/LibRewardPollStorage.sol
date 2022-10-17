// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

library LibRewardPollStorage {
    bytes32 constant REWARD_STORAGE = keccak256('diamond.contract.assetpool.rewardpoll');

    struct RewardStorage {
        uint256 rewardPollDuration;
        Reward[] rewards;
    }

    enum RewardState { Disabled, Enabled }

    struct Reward {
        uint256 id;
        uint256 withdrawAmount;
        uint256 withdrawDuration;
        uint256 pollId;
        RewardState state;
    }

    function rewardStorage() internal pure returns (RewardStorage storage rs) {
        bytes32 position = REWARD_STORAGE;
        assembly {
            rs.slot := position
        }
    }

    struct RewardPollStorage {
        uint256 rewardIndex;
        uint256 withdrawAmount;
        uint256 withdrawDuration;
    }

    function getPosition(uint256 _id) internal pure returns (bytes32) {
        return keccak256(abi.encode('diamond.contract.assetpool.rewardpoll', _id));
    }

    function rewardPollStorage(bytes32 _pos) internal pure returns (RewardPollStorage storage rs) {
        assembly {
            rs.slot := _pos
        }
    }

    function rewardPollStorageId(uint256 _id) internal pure returns (RewardPollStorage storage rs) {
        bytes32 position = getPosition(_id);
        assembly {
            rs.slot := position
        }
    }
}
