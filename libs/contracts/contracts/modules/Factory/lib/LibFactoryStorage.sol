// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

library LibFactoryStorage {
    bytes32 constant FACTORY_STORAGE_POSITION = keccak256('diamond.standard.factory.storage');

    struct FactoryStorage {
        address defaultOwner;
        address defaultRegistry;
    }

    function s() internal pure returns (FactoryStorage storage store) {
        bytes32 position = FACTORY_STORAGE_POSITION;
        assembly {
            store.slot := position
        }
    }
}
