// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

library LibFactoryStorage {
    bytes32 constant FACTORY_STORAGE_POSITION = keccak256('diamond.standard.poolfactory.storage');

    struct Data {
        address defaultController;
        address[] assetPools;
        mapping(address => bool) isAssetPool;
        IDiamondCut.FacetCut[] defaultCut;
    }

    function s() internal pure returns (Data storage bs) {
        bytes32 position = FACTORY_STORAGE_POSITION;
        assembly {
            bs.slot := position
        }
    }
}
