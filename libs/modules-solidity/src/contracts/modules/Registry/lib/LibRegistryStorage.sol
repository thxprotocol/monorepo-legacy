// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/access/Ownable.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

library LibPoolRegistryStorage {
    bytes32 constant STORAGE_POSITION = keccak256('diamond.standard.poolregistry.storage');

    struct Data {
        address feeCollector;
        uint256 feePercentage;
    }

    function s() internal pure returns (Data storage bs) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }
}
