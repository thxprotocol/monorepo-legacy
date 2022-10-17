// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/interfaces/IDiamondCut.sol';

interface IAssetPoolFactory {
    event AssetPoolDeployed(address assetPool);
    event AssetPoolRegistered(address assetPool);

    function setDefaultController(address _controller) external;

    function registerAssetPool(address _pool) external;

    function isAssetPool(address _pool) external view returns (bool);

    function deployAssetPool(IDiamondCut.FacetCut[] memory _facets, address _registry) external;
}
