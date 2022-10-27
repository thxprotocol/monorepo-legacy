// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'diamond-2/contracts/libraries/LibDiamond.sol';
import '../../utils/Access.sol';
import './interfaces/IERC20ProxyFacet.sol';
import './lib/LibERC20Storage.sol';

contract ERC20ProxyFacet is Access, IERC20ProxyFacet {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function getERC20() external view override returns (address) {
        return address(LibERC20Storage.s().token);
    }

    function setERC20(address _erc20) external override onlyOwner {
        LibERC20Storage.ERC20Storage storage s = LibERC20Storage.s();

        require(s.token == IERC20(0) || s.token == IERC20(_erc20), 'ADDRESS_INIT');
        require(_erc20 != address(0), 'ADDRESS_ZERO');

        uint256 MAX_INT = 2**256 - 1;

        s.token = IERC20(_erc20);
        s.token.approve(address(this), MAX_INT);
        emit ERC20ProxyUpdated(address(0), _erc20);
    }

    function totalSupply() external view override returns (uint256) {
        return LibERC20Storage.s().token.totalSupply();
    }

    function name() external view override returns (string memory) {
        // TODO should change storage struct type for token here, but might cause storage pointer conflicts
        return ERC20(address(LibERC20Storage.s().token)).name();
    }

    function symbol() external view override returns (string memory) {
        // TODO should change storage struct type for token here, but might cause storage pointer conflicts
        return ERC20(address(LibERC20Storage.s().token)).symbol();
    }

    function balanceOf(address _account) external view override returns (uint256) {
        return LibERC20Storage.s().token.balanceOf(_account);
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) external override onlyOwner {
        require(_amount > 0, 'ZERO_AMOUNT');
        _transferFrom(_sender, _recipient, _amount);
    }

    function transferFromMany(
        address[] memory _senders,
        address[] memory _recipients,
        uint256[] memory _amounts
    ) external override onlyOwner {
        for (uint256 i = 0; i < _recipients.length; i++) {
            _transferFrom(_senders[i], _recipients[i], _amounts[i]);
        }
    }

    function _transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) internal {
        LibERC20Storage.s().token.safeTransferFrom(_sender, _recipient, _amount);
        emit ERC20ProxyTransferFrom(_sender, _recipient, _amount);
    }
}
