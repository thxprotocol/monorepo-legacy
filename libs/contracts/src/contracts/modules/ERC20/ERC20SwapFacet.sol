// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../Registry/lib/LibRegistryProxyStorage.sol';
import '../Registry/interfaces/IRegistryFacet.sol';
import './interfaces/IERC20SwapFacet.sol';
import './lib/LibERC20Storage.sol';
import '../../utils/Access.sol';

contract ERC20SwapFacet is Access, IERC20SwapFacet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function setSwapRule(address _tokenAddress, uint256 multiplier) external override onlyOwner {
        LibERC20Storage.s().multipliers[_tokenAddress] = multiplier;
        emit ERC20SwapRuleUpdated(_tokenAddress, multiplier);
    }

    function getSwapRule(address _tokenAddress) external view override returns (uint256) {
        return LibERC20Storage.s().multipliers[_tokenAddress];
    }

    function swapFor(
        address _sender,
        uint256 _amountIn,
        address _tokenAddress
    ) external override onlyOwner {
        LibRegistryProxyStorage.RegistryProxyStorage storage rs = LibRegistryProxyStorage.s();
        LibERC20Storage.ERC20Storage storage s = LibERC20Storage.s();

        IERC20 tokenB = IERC20(_tokenAddress);

        require(tokenB.balanceOf(_sender) >= _amountIn, 'INSUFFICIENT_TOKEN_B_BALANCE');
        require(s.multipliers[_tokenAddress] > 0, 'SWAP_NOT_ALLOWED');

        uint256 amountOut = _amountIn.mul(s.multipliers[_tokenAddress]);
        require(s.token.balanceOf(address(this)) >= amountOut, 'INSUFFICIENT_TOKEN_A_BALANCE');

        IRegistryFacet registry = IRegistryFacet(rs.registry);
        uint256 fee = _amountIn.mul(registry.feePercentage()).div(10**18);
        uint256 amount = _amountIn.sub(fee);

        if (fee > 0) {
            tokenB.transferFrom(_sender, registry.feeCollector(), fee);
            emit ERC20SwapFeeCollected(fee);
        }

        tokenB.safeTransferFrom(_sender, address(this), amount);
        s.token.safeTransfer(_sender, amountOut);

        emit ERC20SwapFor(_sender, _amountIn, amountOut, address(this), _tokenAddress);
    }
}
