// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
import '@openzeppelin/contracts/utils/EnumerableSet.sol';

library LibAccessStorage {
    // TODO test with conflicting storage (with other pools)
    // set storage pointer based upon assigned id (by factory)

    bytes32 constant ACCESS_STORAGE_POSITION = keccak256('diamond.standard.access.storage');

    struct RoleStorage {
        mapping(bytes32 => RoleData) roles;
    }

    struct RoleData {
        EnumerableSet.AddressSet members;
        bytes32 adminRole;
    }

    function roleStorage() internal pure returns (RoleStorage storage rs) {
        bytes32 position = ACCESS_STORAGE_POSITION;
        assembly {
            rs.slot := position
        }
    }
}
