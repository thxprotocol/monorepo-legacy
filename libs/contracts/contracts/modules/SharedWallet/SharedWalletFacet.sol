// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import './interfaces/ISharedWalletFacet.sol';
import '../AccessControl/lib/LibAccessStorage.sol';

contract SharedWalletFacet is ISharedWalletFacet {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    modifier onlyManager() {
        require(
            LibAccessStorage.roleStorage().roles[keccak256('MANAGER_ROLE')].members.contains(msg.sender),
            'NOT_MANAGER'
        );
        _;
    }

    function approveERC20(
        address _tokenAddress,
        address _address,
        uint256 _amount
    ) external override onlyManager {
        _approveERC20(_tokenAddress, _address, _amount);
    }

    function _approveERC20(
        address _tokenAddress,
        address _address,
        uint256 _amount
    ) internal {
        IERC20(_tokenAddress).approve(_address, _amount);
    }

    function approveERC721(
        address _tokenAddress,
        address _address,
        uint256 _tokenId
    ) external override onlyManager {
        _approveERC721(_tokenAddress, _address, _tokenId);
    }

    function _approveERC721(
        address _tokenAddress,
        address _address,
        uint256 _tokenId
    ) internal {
        IERC721 erc721Token = IERC721(_tokenAddress);
        require(erc721Token.ownerOf(_tokenId) == address(this), 'TOKEN_NOT_OWNED');
        erc721Token.approve(_address, _tokenId);
    }

    function transferERC20(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external override onlyManager {
        IERC20 erc20Token = IERC20(_tokenAddress);
        require(erc20Token.balanceOf(address(this)) >= _amount, 'INSUFFICIENT_BALANCE');
        _approveERC20(_tokenAddress, address(this), _amount);
        erc20Token.safeTransferFrom(address(this), _to, _amount);
    }

    function transferERC721(
        address _tokenAddress,
        address _to,
        uint256 _tokenId
    ) external override onlyManager {
        IERC721 erc721Token = IERC721(_tokenAddress);
        require(erc721Token.ownerOf(_tokenId) == address(this), 'TOKEN_NOT_OWNED');
        erc721Token.safeTransferFrom(address(this), _to, _tokenId);
    }

    function onERC721Received(address, address, uint256, bytes calldata) override external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
