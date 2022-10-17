// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../../utils/Access.sol';
import './interfaces/IRegistryProxyFacet.sol';
import './lib/LibRegistryProxyStorage.sol';

contract RegistryProxyFacet is Access, IRegistryProxyFacet {
    using SafeMath for uint256;

    /**
     * @notice Sets registry address for the asset pool.
     * @param _registry Address of the registry contract.
     * @dev Registry contains general pool settings and will be governable at some point.
     */
    function setRegistry(address _registry) external override onlyOwner {
        LibRegistryProxyStorage.s().registry = _registry;
        emit RegistryProxyUpdated(address(0), _registry);
    }

    /**
     * @return address of the registry contract of the asset pool.
     */
    function getRegistry() external view override returns (address) {
        return LibRegistryProxyStorage.s().registry;
    }
}
