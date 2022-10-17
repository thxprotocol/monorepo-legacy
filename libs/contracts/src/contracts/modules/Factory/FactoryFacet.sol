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
     * @param _erc20 address ERC20 address.
     * @param _erc721 address ERC721 address.
     */
    function deploy(
        IDiamondCut.FacetCut[] memory _facets,
        address _erc20,
        address _erc721
    ) external override {
        LibDiamond.enforceIsContractOwner();
        LibFactoryStorage.FactoryStorage storage s = LibFactoryStorage.s();
        IDefaultDiamond d = _deploy(_facets, s.defaultRegistry);

        if (_erc20 != address(0)) {
            d.setERC20(_erc20);
        }
        if (_erc721 != address(0)) {
            d.setERC721(_erc721);
        }
        d.transferOwnership(s.defaultOwner);

        emit DiamondDeployed(address(d), _erc721);
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
