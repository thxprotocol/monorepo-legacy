// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../Registry/lib/LibRegistryProxyStorage.sol';
import '../Registry/interfaces/IRegistryFacet.sol';
import './interfaces/IERC20DepositFacet.sol';
import './lib/LibERC20Storage.sol';
import '../../utils/Access.sol';

contract ERC20DepositFacet is Access, IERC20DepositFacet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function depositFrom(address _sender, uint256 _amount) external override {
        require(_amount > 0, 'ZERO_AMOUNT');
        _deposit(_sender, _amount);
    }

    function depositFromMany(address[] memory _senders, uint256[] memory _amounts) external override {
        for (uint256 i = 0; i < _senders.length; i++) {
            _deposit(_senders[i], _amounts[i]);
        }
    }

    function _deposit(address _sender, uint256 _amount) internal {
        LibRegistryProxyStorage.RegistryProxyStorage storage rs = LibRegistryProxyStorage.s();
        LibERC20Storage.ERC20Storage storage s = LibERC20Storage.s();
        IRegistryFacet registry = IRegistryFacet(rs.registry);

        uint256 fee = _amount.mul(registry.feePercentage()).div(10**18);
        uint256 amount = _amount.sub(fee);

        if (fee > 0) {
            s.token.safeTransferFrom(_sender, registry.feeCollector(), fee);
            emit ERC20DepositFeeCollected(fee);
        }

        s.token.safeTransferFrom(_sender, address(this), amount);
        emit ERC20DepositFrom(_sender, amount);
    }
}
