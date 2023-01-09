// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../Registry/interfaces/IRegistryFacet.sol';
import '../Registry/lib/LibRegistryProxyStorage.sol';
import './lib/LibERC20Storage.sol';
import './interfaces/IERC20WithdrawFacet.sol';
import '../../utils/Access.sol';

contract ERC20WithdrawFacet is Access, IERC20WithdrawFacet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function withdrawFor(address _receiver, uint256 _amount, address _tokenAddress) external override onlyOwner {
        require(_amount > 0, 'ZERO_AMOUNT');
        _withdrawFor(_receiver, _amount, _tokenAddress);
    }

    function withdrawForMany(address[] memory _receivers, uint256[] memory _amounts,  address[] calldata _tokenAddresses) external override onlyOwner {
        require(_amounts.length == _receivers.length, 'INVALID_INPUT');

        for (uint256 i = 0; i < _receivers.length; i++) {
            _withdrawFor(_receivers[i], _amounts[i], _tokenAddresses[i]);
        }
    }

    function _withdrawFor(address _receiver, uint256 _amount, address _tokenAddress) internal {
        LibRegistryProxyStorage.RegistryProxyStorage storage rs = LibRegistryProxyStorage.s();
        IRegistryFacet registry = IRegistryFacet(rs.registry);
        uint256 fee = _amount.mul(registry.feePercentage()).div(10**18);
        IERC20 token = IERC20(_tokenAddress);
        if (fee > 0) {
            token.safeTransfer(registry.feeCollector(), fee);
            emit ERC20WithdrawFeeCollected(fee);
        }

        token.safeTransfer(_receiver, _amount);
        emit ERC20WithdrawFor(_receiver, _amount, _tokenAddress);
    }
}
