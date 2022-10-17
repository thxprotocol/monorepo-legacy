// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import 'diamond-2/contracts/libraries/LibDiamond.sol';
import './lib/LibRegistryStorage.sol';
import './interfaces/IRegistryFacet.sol';

contract RegistryFacet is IRegistryFacet {
    /**
     * @param _feeCollector Address of the FeeCollector contract.
     * @param _feePercentage Integer representing the deposit fee percentage.
     */
    function initialize(address _feeCollector, uint256 _feePercentage) external override {
        LibDiamond.enforceIsContractOwner();

        LibPoolRegistryStorage.Data storage s = LibPoolRegistryStorage.s();
        s.feeCollector = _feeCollector;
        s.feePercentage = _feePercentage;
    }

    /**
     * @param _feeCollector Address of the FeeCollector contract.
     */
    function setFeeCollector(address _feeCollector) external override {
        LibDiamond.enforceIsContractOwner();

        LibPoolRegistryStorage.Data storage s = LibPoolRegistryStorage.s();
        s.feeCollector = _feeCollector;
    }

    /**
     * @param _feePercentage 0 - 10**18 value used for substracting fees from deposits into an asset pool.
     */
    function setFeePercentage(uint256 _feePercentage) external override {
        LibDiamond.enforceIsContractOwner();

        LibPoolRegistryStorage.Data storage s = LibPoolRegistryStorage.s();
        s.feePercentage = _feePercentage;
    }

    function feeCollector() external view override returns (address) {
        return LibPoolRegistryStorage.s().feeCollector;
    }

    function feePercentage() external view override returns (uint256) {
        return LibPoolRegistryStorage.s().feePercentage;
    }
}
