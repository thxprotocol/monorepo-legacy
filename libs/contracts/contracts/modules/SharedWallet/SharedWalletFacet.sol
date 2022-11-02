// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';

import './interfaces/ISharedWalletFacet.sol';
import '../AccessControl/lib/LibAccessStorage.sol';

contract SharedWalletFacet is ISharedWalletFacet {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    modifier onlyManager() {
        require(
            LibAccessStorage.roleStorage().roles[keccak256('MANAGER_ROLE')].members.contains(msg.sender),
            'Caller is not a manager'
        );
        _;
    }

    function approveERC20(
        address _tokenAddress,
        address _address,
        uint256 _amount
    ) external override onlyManager {
        IERC20(_tokenAddress).approve(_address, _amount);
    }

    function approveERC721(
        address _tokenAddress,
        address _address,
        uint256 _tokenId
    ) external override onlyManager {
        IERC721 erc721Token = IERC721(_tokenAddress);
        require(erc721Token.ownerOf(_tokenId) == msg.sender, 'Sender is not the owner of the token');
        erc721Token.approve(_address, _tokenId);
    }

    function transferERC20(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external override onlyManager {
        IERC20 erc20Token = IERC20(_tokenAddress);
        require(erc20Token.balanceOf(msg.sender) >= _amount, 'INSUFFICIENT BALANCE');
        erc20Token.safeTransferFrom(msg.sender, _to, _amount);
    }

    function transferERC721(
        address _tokenAddress,
        address _to,
        uint256 _tokenId
    ) external override onlyManager {
        IERC721 erc721Token = IERC721(_tokenAddress);
        require(erc721Token.ownerOf(_tokenId) == msg.sender, 'Sender is not the owner of the token');
        erc721Token.safeTransferFrom(msg.sender, _to, _tokenId);
    }
}
