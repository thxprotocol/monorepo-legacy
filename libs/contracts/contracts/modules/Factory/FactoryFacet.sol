// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import { Diamond } from 'diamond-2/contracts/Diamond.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../../interfaces/IDefaultDiamond.sol';
import './interfaces/IFactoryFacet.sol';
import './lib/LibFactoryStorage.sol';

contract FactoryFacet is IFactoryFacet {
    /**
     * @notice Sets the controller for the factory diamond.
     * @param _owner Address of the default owner.
     * @param _registry Address of the default registry contract.
     */
    function initialize(address _owner, address _registry) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.FactoryStorage storage s = LibFactoryStorage.s();
        s.defaultOwner = _owner;
        s.defaultRegistry = _registry;
    }

    /**
     * @param _facets string Array of FacetCuts that should be deployed
     */
    function deploy(IDiamondCut.FacetCut[] memory _facets) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.FactoryStorage storage s = LibFactoryStorage.s();
        IDefaultDiamond d = _deploy(_facets, s.defaultRegistry);

        d.transferOwnership(s.defaultOwner);

        emit DiamondDeployed(address(d));
    }

    function _deploy(IDiamondCut.FacetCut[] memory _facets, address _registry) internal returns (IDefaultDiamond) {
        Diamond.DiamondArgs memory args;

        args.owner = address(this);

        Diamond diamond = new Diamond(_facets, args);
        IDefaultDiamond d = IDefaultDiamond(address(diamond));

        d.setRegistry(_registry);

        return d;
    }
}
