// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

/// @dev This Lib is used to create unique storage pointers and store structured data in them.
library LibBasePollStorage {
    bytes32 constant BASE_STORAGE = keccak256('diamond.contract.assetpool.basepoll');

    /**
     * @dev Stores the amount of polls created in the diamond.
     */
    struct BaseStorage {
        uint256 pollCounter;
    }

    /**
     * @dev Stores the information of a poll for a given storage pointer.
     */
    struct BasePollStorage {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 yesCounter;
        uint256 noCounter;
        uint256 totalVoted;
        mapping(address => Vote) votesByAddress;
    }
    /**
     * @dev Stores a vote for a poll in BasePollStorage.votesByAddress.
     */
    struct Vote {
        uint256 time;
        uint256 weight;
        bool agree;
    }

    /**
     * @param _id The ID of a poll.
     * @return storage position for a given poll id
     */
    function getPosition(uint256 _id) internal pure returns (bytes32) {
        return keccak256(abi.encode('diamond.contract.assetpool.basepoll', _id));
    }

    /**
     * @return bs The base storage containing pollCounter of all polls.
     */
    function baseStorage() internal pure returns (BaseStorage storage bs) {
        bytes32 position = BASE_STORAGE;
        assembly {
            bs.slot := position
        }
    }

    /**
     * @param _pos The storage position of the poll.
     * @return bs The BasePollStorage struct storage for a poll its storage position.
     */
    function basePollStorage(bytes32 _pos) internal pure returns (BasePollStorage storage bs) {
        assembly {
            bs.slot := _pos
        }
    }

    /**
     * @param _id The poll id
     * @return bs The BasePollStorage struct storage for a given poll ID.
     */
    function basePollStorageId(uint256 _id) internal pure returns (BasePollStorage storage bs) {
        bytes32 position = getPosition(_id);
        assembly {
            bs.slot := position
        }
    }
}
